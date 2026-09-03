import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { createPublicKey, createSign, randomBytes, randomUUID } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const runtimeDir = join(process.cwd(), 'test-results/financial-closing/runtime')
// The E2E topology deliberately matches the documented local endpoints.
// The browser receives only the BFF URL; port 8081 is server-to-server.
const appPort = Number(process.env.CLOSING_E2E_APP_PORT ?? 5173)
const apiPort = Number(process.env.CLOSING_E2E_API_PORT ?? 8080)
const closingPort = Number(process.env.CLOSING_E2E_SERVICE_PORT ?? 8081)
let api: ChildProcess | undefined
let closing: ChildProcess | undefined
let app: ChildProcess | undefined

const base64url = (value: Buffer | string) => Buffer.from(value).toString('base64url')
const waitFor = async (url: string, label: string, isReady = (response: Response) => response.ok) => {
  const deadline = Date.now() + 90_000
  let latest = ''
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (isReady(response)) return
      latest = `${response.status}`
    } catch (error) { latest = String(error) }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`${label} did not become ready: ${latest}`)
}

const existingHarnessIsHealthy = async () => {
  const stateFile = join(runtimeDir, 'state.json')
  if (!existsSync(stateFile)) return false
  try {
    const state = JSON.parse(readFileSync(stateFile, 'utf8')) as {
      appPort: number; apiPort: number; closingPort: number; workspaceId: string; accessToken: string
    }
    if (state.appPort !== appPort || state.apiPort !== apiPort || state.closingPort !== closingPort) return false
    const [appResponse, apiResponse, closingResponse] = await Promise.all([
      fetch(`http://127.0.0.1:${appPort}`),
      fetch(`http://127.0.0.1:${apiPort}/api/financial-closings`, {
        headers: { Authorization: `Bearer ${state.accessToken}`, 'X-Workspace-Id': state.workspaceId },
      }),
      fetch(`http://127.0.0.1:${closingPort}/q/health`),
    ])
    return appResponse.ok && apiResponse.ok && closingResponse.ok
  } catch { return false }
}

const portOwner = (port: number) => {
  try {
    return execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fpcn'], { encoding: 'utf8' })
      .trim().replace(/\n/g, ' ')
  } catch { return 'processo não identificado' }
}

const requireAvailablePort = (port: number, service: string) => new Promise<void>((resolve, reject) => {
  const server = createServer()
  server.once('error', () => reject(new Error(
    `A porta ${port} (${service}) está em uso por ${portOwner(port)}, mas não pertence a uma topologia E2E saudável com credenciais sintéticas correspondentes. O processo foi preservado.`,
  )))
  server.listen(port, '127.0.0.1', () => server.close(error => error ? reject(error) : resolve()))
})

const createDemoWorkspace = async (url: string, authorization: string, payload: Record<string, unknown>) => {
  const deadline = Date.now() + 15_000
  let latest = ''
  while (Date.now() < deadline) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (response.ok) return response
    latest = `${response.status} ${response.headers.get('www-authenticate') ?? ''} ${await response.text()}`
    // The endpoint is reachable before its local JWT key reader has fully
    // initialized. Retrying the same idempotency identifiers keeps setup local
    // and avoids a flaky failure before Playwright opens the browser.
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Demo workspace could not be created: ${latest}`)
}

const token = (privateKey: string, payload: Record<string, unknown>) => {
  const header = base64url(JSON.stringify({ alg: 'RS256', kid: 'financial-closing-demo', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const body = base64url(JSON.stringify({ iss: 'cobudget-demo', iat: now, exp: now + 3_600, ...payload }))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${body}`)
  return `${header}.${body}.${signer.sign(privateKey).toString('base64url')}`
}

const stop = async (child: ChildProcess | undefined) => {
  if (!child || child.exitCode !== null) return
  await new Promise<void>(resolve => {
    const timeout = setTimeout(resolve, 5_000)
    child.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
    // Every process is spawned in its own group. Quarkus dev starts a JVM
    // below Gradle and Vite below npm, so stopping only the launcher leaks a
    // server into the next E2E invocation.
    if (child.pid) process.kill(-child.pid, 'SIGTERM')
    else child.kill('SIGTERM')
  })
}

export default async function setup() {
  if (await existingHarnessIsHealthy()) return async () => undefined
  await Promise.all([
    requireAvailablePort(appPort, 'budget-app'),
    requireAvailablePort(apiPort, 'budget-api'),
    requireAvailablePort(closingPort, 'financial-closing-service'),
  ])
  rmSync(runtimeDir, { recursive: true, force: true })
  mkdirSync(runtimeDir, { recursive: true })
  const privateKey = join(runtimeDir, 'demo-private.pem')
  const publicKey = join(runtimeDir, 'demo-public.pem')
  execFileSync('openssl', ['genrsa', '-out', privateKey, '2048'])
  execFileSync('openssl', ['rsa', '-in', privateKey, '-pubout', '-out', publicKey])
  const jwk = createPublicKey(readFileSync(publicKey, 'utf8')).export({ format: 'jwk' }) as JsonWebKey
  const jwks = join(runtimeDir, 'demo-jwks.json')
  writeFileSync(jwks, JSON.stringify({ keys: [{ ...jwk, kid: 'financial-closing-demo', use: 'sig', alg: 'RS256' }] }))
  // SmallRye resolves a JWK set as a URL. A bare absolute path is interpreted
  // as a remote location and makes the disposable demo token fail validation.
  const demoPublicKey = pathToFileURL(jwks).toString()
  const internalServiceToken = randomBytes(32).toString('base64url')
  const authorizationHmacKey = randomBytes(32).toString('base64url')
  const provisioningServiceToken = randomBytes(32).toString('base64url')
  const externalReferenceHmacKey = randomBytes(32).toString('base64')
  const sensitiveDataKey = randomBytes(32).toString('base64')
  const commonEnv = {
    ...process.env,
    DEMO_API_PORT: String(apiPort),
    DEMO_JWT_PUBLIC_KEY: demoPublicKey,
    AUTH_ISSUER_URI: 'cobudget-demo',
    AUTH_JWK_SET_URI: demoPublicKey,
    FINANCIAL_CLOSING_SERVICE_URL: `http://127.0.0.1:${closingPort}`,
    CLOSING_INTERNAL_SERVICE_TOKEN: internalServiceToken,
    CLOSING_AUTHORIZATION_HMAC_KEY: authorizationHmacKey,
    CLOSING_INTEGRATION_URL: `http://127.0.0.1:${closingPort}`,
    CLOSING_INTEGRATION_SERVICE_TOKEN: internalServiceToken,
    CLOSING_INTEGRATION_AUTHORIZATION_HMAC_KEY: authorizationHmacKey,
    CLOSING_PROVISIONING_SERVICE_TOKEN: provisioningServiceToken,
    CLOSING_EXTERNAL_REFERENCE_HMAC_KEY: externalReferenceHmacKey,
    CLOSING_SENSITIVE_DATA_KEY: sensitiveDataKey,
    // Keep an isolated Playwright topology usable when the developer's normal
    // 5173/8080 stack is already running. This is test-only configuration.
    APP_CORS_ALLOWED_ORIGINS: `http://127.0.0.1:${appPort},http://localhost:${appPort}`,
  }
  const localJava21 = process.env.CLOSING_E2E_JAVA_HOME
    ?? ['/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home', '/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home'].find(existsSync)
  let localJava24: string | undefined
  try { localJava24 = execFileSync('/usr/libexec/java_home', ['-v', '24'], { encoding: 'utf8' }).trim() || undefined } catch { /* JDK 24 is optional */ }
  const closingArgs = localJava21 ? ['quarkusDev'] : localJava24
    ? ['-I', join(process.cwd(), 'e2e/java24-local-fallback.init.gradle'), 'quarkusDev'] : ['quarkusDev']
  closing = spawn('./gradlew', ['--no-daemon', ...closingArgs], {
    cwd: '../financial-closing-service',
    env: {
      ...process.env,
      ...((localJava21 ?? localJava24) ? { JAVA_HOME: localJava21 ?? localJava24 } : {}),
      PORT: String(closingPort),
      CLOSING_INTERNAL_SERVICE_TOKEN: internalServiceToken,
      CLOSING_AUTHORIZATION_HMAC_KEY: authorizationHmacKey,
      CLOSING_EXTERNAL_REFERENCE_HMAC_KEY: externalReferenceHmacKey,
      CLOSING_SENSITIVE_DATA_KEY: sensitiveDataKey,
      CLOSING_BUDGET_API_URL: `http://127.0.0.1:${apiPort}/api`,
      CLOSING_PROVISIONING_SERVICE_TOKEN: provisioningServiceToken,
      CLOSING_PROVISIONING_DISPATCH_ENABLED: 'true',
      CLOSING_PROVISIONING_DISPATCH_DELAY: '1s',
      CLOSING_PROVISIONING_DISPATCH_EVERY: '1s',
    },
    stdio: 'pipe', detached: true,
  })
  closing.stdout?.on('data', value => appendFileSync(join(runtimeDir, 'closing.log'), value))
  closing.stderr?.on('data', value => appendFileSync(join(runtimeDir, 'closing.log'), value))
  await waitFor(`http://127.0.0.1:${closingPort}/q/health`, 'financial closing service')
  api = spawn('./gradlew', ['--no-daemon', 'quarkusDev', '-Dquarkus.profile=demo'], { cwd: '../budget-api', env: commonEnv, stdio: 'pipe', detached: true })
  api.stdout?.on('data', value => appendFileSync(join(runtimeDir, 'api.log'), value))
  api.stderr?.on('data', value => appendFileSync(join(runtimeDir, 'api.log'), value))
  await waitFor(
    `http://127.0.0.1:${apiPort}/api/workspaces`,
    'demo API',
    response => response.status === 401 || response.status === 403,
  )
  const initialToken = token(readFileSync(privateKey, 'utf8'), {
    sub: 'demo-owner', user_id: 'demo-owner', user_fullname: 'Operador de demonstração',
    user_language: 'PT', userRoles: ['ROLE_ADMIN'], groups: ['ROLE_ADMIN'],
  })
  const workspaceResponse = await createDemoWorkspace(
    `http://127.0.0.1:${apiPort}/api/workspaces`,
    `Bearer ${initialToken}`,
    { name: 'Demonstração de fechamento', description: 'Dados inteiramente sintéticos', country: 'BR', currency: 'BRL', correlationId: randomUUID(), messageId: randomUUID() },
  )
  const workspace = await workspaceResponse.json() as { workspaceId: string; name: string }
  const accessToken = token(readFileSync(privateKey, 'utf8'), {
    sub: 'demo-owner', user_id: 'demo-owner', user_fullname: 'Operador de demonstração',
    user_language: 'PT', userRoles: ['ROLE_ADMIN'], groups: ['ROLE_ADMIN'], tenantRole: 'ROLE_OWNER',
    workspaceId: workspace.workspaceId,
    workspaces: [{ workspaceId: workspace.workspaceId, workspaceName: workspace.name, role: 'ROLE_OWNER' }],
  })
  writeFileSync(join(runtimeDir, 'state.json'), JSON.stringify({ apiPort, closingPort, appPort, workspaceId: workspace.workspaceId, workspaceName: workspace.name, accessToken }))
  app = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(appPort)], { cwd: process.cwd(), env: { ...process.env, VITE_API_BASE_URL: `http://127.0.0.1:${apiPort}/api`, VITE_AUTH_URL: 'http://127.0.0.1:9999' }, stdio: 'pipe', detached: true })
  app.stderr?.on('data', () => undefined)
  await waitFor(`http://127.0.0.1:${appPort}`, 'demo app')
  return async () => {
    await Promise.all([stop(app), stop(api), stop(closing)])
  }
}
