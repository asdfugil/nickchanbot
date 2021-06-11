#!/usr/bin/env node
console.log(`Nick Chan Bot Copyright (C) 2021 Assfugil
This program comes with ABSOLUTELY NO WARRANTY;
This is free software, and you are welcome to redistribute it
under the conditions of the GNU GPL-3.0 or a later version; `)
const { exec } = require('child_process')
const proxy = exec('node server/index.js')
console.log('[Main] Started proxy server.')
const bot = exec('node manager.js')
console.log('[Main] Started bot')
proxy.stderr.on('data',data => process.stderr.write(`[Proxy] ${data.toString()}`))
bot.stderr.on('data',data => process.stderr.write(`[Bot] ${data.toString()}`))
proxy.stdout.on('data',data => process.stdout.write(`[Proxy] ${data.toString()}`))
bot.stdout.on('data',data => process.stdout.write(`[Bot] ${data.toString()}`))
require('fs').writeFileSync('pidfile',process.pid.toString())
process.on('SIGTERM',() => {
  console.log('[Main] SIGTERM')
  console.log('[Main] Killing child')
  bot.kill('SIGTERM')
  proxy.kill('SIGTERM')
  process.exit(0)
})
