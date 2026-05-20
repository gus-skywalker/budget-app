import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const root = process.cwd()
const localeDir = path.join(root, 'src/assets/locales')
const sourceDirs = ['src/views', 'src/components', 'src/utils', 'src/services', 'src/router']
const languages = ['pt', 'en']

function flatten(value, prefix = '', output = {}) {
  for (const [key, child] of Object.entries(value || {})) {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      flatten(child, nextKey, output)
    } else {
      output[nextKey] = child
    }
  }
  return output
}

function readJsonLocale(language) {
  return JSON.parse(fs.readFileSync(path.join(localeDir, `${language}.json`), 'utf8'))
}

function loadTsMessages(relativeFile) {
  const file = path.join(root, relativeFile)
  let source = fs.readFileSync(file, 'utf8')
  if (source.trim().startsWith('export default')) {
    source = source.replace(/^export default/, 'result =')
  } else {
    const match = source.match(/const\s+(\w+)\s*=\s*{/)
    if (!match) {
      throw new Error(`Unable to find exported messages in ${relativeFile}`)
    }
    source = source.replace(/export default \w+\s*$/m, '')
    source += `\nresult = ${match[1]};`
  }

  const context = { result: null }
  vm.createContext(context)
  vm.runInContext(source, context, { filename: relativeFile })
  return context.result
}

function mergeMessages(language) {
  const base = readJsonLocale(language)
  const landingPage = loadTsMessages('src/assets/locales/modules/landingPage.ts')[language] || {}
  const contentExperience = loadTsMessages('src/assets/locales/modules/contentExperience.ts')[language] || {}
  return {
    ...base,
    ...landingPage,
    ...contentExperience,
  }
}

function collectSourceFiles(dir, output = []) {
  if (!fs.existsSync(dir)) return output
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, output)
    } else if (!fullPath.includes(`${path.sep}__tests__${path.sep}`) && /\.(vue|ts|tsx|js|jsx)$/.test(entry.name)) {
      output.push(fullPath)
    }
  }
  return output
}

function collectStaticTranslationKeys() {
  const keys = new Set()
  const files = sourceDirs.flatMap((dir) => collectSourceFiles(path.join(root, dir)))
  const translationCallPattern = /(?:\bthis\.\$t|\$t|\bt)\(\s*['"]([A-Za-z0-9_.-]+)['"]/g

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(translationCallPattern)) {
      keys.add(match[1])
    }
  }

  return [...keys].sort()
}

const flattened = Object.fromEntries(
  languages.map((language) => [language, flatten(mergeMessages(language))])
)

const errors = []

for (const [left, right] of [
  ['pt', 'en'],
  ['en', 'pt'],
]) {
  const missing = Object.keys(flattened[right]).filter((key) => !(key in flattened[left]))
  if (missing.length) {
    errors.push(`${left} is missing ${missing.length} key(s) present in ${right}:\n${missing.join('\n')}`)
  }
}

for (const key of collectStaticTranslationKeys()) {
  for (const language of languages) {
    if (!(key in flattened[language])) {
      errors.push(`${language} is missing referenced key: ${key}`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n\n'))
  process.exit(1)
}

console.log('i18n audit passed for pt/en')
