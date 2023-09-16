#!/usr/bin/env node

/* eslint-disable no-var */
'use strict'

var ver = process.versions.node
var majorVer = parseInt(ver.split('.')[0], 10)

if (majorVer < 4) {
  console.error(
    'Node version ' +
      ver +
      ' is not supported, please use Node.js 4.0 or higher.'
  )
  process.exit(1) // eslint-disable-line no-process-exit
} else {
  require(__dirname + '/../dist/index.js')
}
