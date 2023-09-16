import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import { Command } from 'commander'
import type { CommandConfig } from './types'

const packagePath = resolve(__dirname, '../../package.json')
const commitPath = resolve(__dirname, '../../COMMIT')

export const version: CommandConfig = (program: Command) => {
  return program
    .command('version')
    .summary('report the installed version')
    .description(`Reads the version from ${chalk.primary.bold(packagePath)}`)
    .action(handler)
}

function handler() {
  const { name, version: pkgVersion } = JSON.parse(
    readFileSync(packagePath, 'utf8')
  ) as { name: string; version: string }

  const version = existsSync(commitPath)
    ? `${pkgVersion}-${readFileSync(commitPath, 'utf8').trim()}`
    : pkgVersion

  chalk.draw(`${chalk.primary.bold(name)} ${chalk.accent.bold(version)}`)
}
