import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const publicDir = resolve(root, 'public')
const portFile = resolve(publicDir, 'data-server-port.json')

function isAvailable(port) {
  return new Promise(resolvePort => {
    const server = createServer()
    server.once('error', () => resolvePort(false))
    server.listen({ port, host: '::' }, () => server.close(() => resolvePort(true)))
  })
}

let port = 4000
while (port <= 4010 && !(await isAvailable(port))) port += 1
if (port > 4010) {
  console.error('4000–4010 portlar band. Ishlayotgan serverni to‘xtating yoki portni bo‘shating.')
  process.exit(1)
}

mkdirSync(publicDir, { recursive: true })
writeFileSync(portFile, JSON.stringify({ port }, null, 2))
console.log(`data.json API uchun bo‘sh port tanlandi: ${port}`)

const jsonServerCli = resolve(root, 'node_modules/json-server/lib/bin.js')
const child = spawn(process.execPath, [jsonServerCli, '--watch', 'data.json', '--port', String(port)], {
  cwd: root,
  stdio: 'inherit',
})

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('error', error => {
  console.error('JSON Server ishga tushmadi:', error.message)
  process.exitCode = 1
})
child.on('exit', code => {
  try { unlinkSync(portFile) } catch { /* the file may already be absent */ }
  process.exit(code ?? 0)
})
