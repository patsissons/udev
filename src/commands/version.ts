import chalk from 'chalk'
import type { Command } from 'commander'
import { packagePath, readPackageVersion } from '@/utils/package'
import type { CommandConfig } from './types'

export const version: CommandConfig = (program: Command) => {
  return program
    .command('version')
    .summary('report the installed version')
    .description(`Reads the version from ${chalk.primary.bold(packagePath)}`)
    .action(handler)
}

function handler() {
  const { name, version } = readPackageVersion()

  chalk.draw(`${chalk.primary.bold(name)} ${chalk.accent.bold(version)}`)
}
