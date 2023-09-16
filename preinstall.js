// shamelessly ported from yarn's preinstall.js
if (process.env.npm_config_global) {
  var cp = require('child_process')
  var fs = require('fs')
  var path = require('path')

  try {
    var targetPath = cp
      .execFileSync(process.execPath, [process.env.npm_execpath, 'bin', '-g'], {
        encoding: 'utf8',
        stdio: ['ignore', undefined, 'ignore'],
      })
      .replace(/\n/g, '')

    var manifest = require('./package.json')
    var binNames =
      typeof manifest.bin === 'string'
        ? [manifest.name.replace(/^@[^\/]+\//, '')]
        : typeof manifest.bin === 'object' && manifest.bin !== null
        ? Object.keys(manifest.bin)
        : []

    binNames.forEach(function (binName) {
      var binPath = path.join(targetPath, binName)

      var binTarget
      try {
        binTarget = fs.readlinkSync(binPath)
      } catch (err) {
        return
      }

      if (binTarget.startsWith('../lib/node_modules/corepack/')) {
        try {
          fs.unlinkSync(binPath)
        } catch (err) {
          return
        }
      }
    })
  } catch (err) {
    // ignore errors
  }
}
