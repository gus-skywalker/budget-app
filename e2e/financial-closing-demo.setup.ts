import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { createPublicKey, createSign, randomBytes, randomUUID } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'

const runtimeDir = join(process.cwd(), 'test-results/financial-closing-demo/runtime')
const appPort = 5176
let api: ChildProcess | undefined
let app: ChildProcess | undefined

const base64url = (value: Buffer | string) => Buffer.from(value).toString('base64url')
const availablePort = () => new Promise<number>((resolve, reject) => {
  const server = createServer()
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    if (address === null || typeof address === 'string') return reject(new Error('Could not reserve a loopback port'))
    server.close(error => error ? reject(error) : resolve(address.port))
  })
})

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
    child.kill('SIGTERM')
  })
}

export default async function setup() {
  rmSync(runtimeDir, { recursive: true, force: true })
  mkdirSync(runtimeDir, { recursive: true })
  const apiPort = await availablePort()
  const privateKey = join(runtimeDir, 'demo-private.pem')
  const publicKey = join(runtimeDir, 'demo-public.pem')
  execFileSync('openssl', ['genrsa', '-out', privateKey, '2048'])
  execFileSync('openssl', ['rsa', '-in', privateKey, '-pubout', '-out', publicKey])
  const jwk = createPublicKey(readFileSync(publicKey, 'utf8')).export({ format: 'jwk' }) as JsonWebKey
  const jwks = join(runtimeDir, 'demo-jwks.json')
  writeFileSync(jwks, JSON.stringify({ keys: [{ ...jwk, kid: 'financial-closing-demo', use: 'sig', alg: 'RS256' }] }))
  const demoPublicKey = jwks
  const commonEnv = {
    ...process.env,
    DEMO_API_PORT: String(apiPort),
    DEMO_JWT_PUBLIC_KEY: demoPublicKey,
    AUTH_ISSUER_URI: 'cobudget-demo',
    AUTH_JWK_SET_URI: demoPublicKey,
    CLOSING_EXTERNAL_REFERENCE_HMAC_KEY: randomBytes(32).toString('base64'),
    CLOSING_SENSITIVE_DATA_KEY: randomBytes(32).toString('base64'),
  }
  api = spawn('./gradlew', ['quarkusDev', '-Dquarkus.profile=demo'], { cwd: '../budget-api', env: commonEnv, stdio: 'pipe' })
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
  const workspaceResponse = await fetch(`http://127.0.0.1:${apiPort}/api/workspaces`, {
    method: 'POST', headers: { Authorization: `Bearer ${initialToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Demonstração de fechamento', description: 'Dados inteiramente sintéticos', country: 'BR', currency: 'BRL', correlationId: randomUUID(), messageId: randomUUID() }),
  })
  if (!workspaceResponse.ok) {
    await new Promise(resolve => setTimeout(resolve, 250))
    throw new Error(`Demo workspace could not be created: ${workspaceResponse.status} ${workspaceResponse.headers.get('www-authenticate') ?? ''} ${await workspaceResponse.text()}`)
  }
  const workspace = await workspaceResponse.json() as { workspaceId: string; name: string }
  const accessToken = token(readFileSync(privateKey, 'utf8'), {
    sub: 'demo-owner', user_id: 'demo-owner', user_fullname: 'Operador de demonstração',
    user_language: 'PT', userRoles: ['ROLE_ADMIN'], groups: ['ROLE_ADMIN'], tenantRole: 'ROLE_OWNER',
    workspaceId: workspace.workspaceId,
    workspaces: [{ workspaceId: workspace.workspaceId, workspaceName: workspace.name, role: 'ROLE_OWNER' }],
  })
  writeFileSync(join(runtimeDir, 'state.json'), JSON.stringify({ apiPort, appPort, workspaceId: workspace.workspaceId, workspaceName: workspace.name, accessToken }))
  app = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(appPort)], { cwd: process.cwd(), env: { ...process.env, VITE_API_BASE_URL: `http://127.0.0.1:${apiPort}/api`, VITE_AUTH_URL: 'http://127.0.0.1:9999' }, stdio: 'pipe' })
  app.stderr?.on('data', () => undefined)
  await waitFor(`http://127.0.0.1:${appPort}`, 'demo app')
  return async () => {
    await Promise.all([stop(app), stop(api)])
    rmSync(runtimeDir, { recursive: true, force: true })
  }
}
