import { existsSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import type { Command } from 'commander'
import { runCommandAndLog } from '@/utils/runner'
import type { CommandConfig } from './types'

const installerPath = resolve(__dirname, '../../install.sh')

export const update: CommandConfig = (program: Command) => {
  return program
    .command('update')
    .summary('updates to the latest version')
    .description(
      `Update ${chalk.primary.bold(
        'μdev'
      )} to the latest version on the ${chalk.accent.bold('main')} branch`
    )
    .action(handler)
}

async function handler() {
  if (!existsSync(installerPath)) {
    chalk.draw(
      chalk.error(
        `Installer script not found: ${chalk.primary.bold(
          installerPath
        )}. Try reinstalling μdev with ${chalk.accent.bold(
          '/bin/bash -c "$(curl -fsSL https://patsissons.github.io/udev/install.sh)"'
        )}`
      )
    )
    return
  }

  await runCommandAndLog(`sh ${installerPath}`)
}
