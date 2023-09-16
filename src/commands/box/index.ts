import chalk from 'chalk'
import type { Command } from 'commander'
import { createContext, configFileName, type Options } from '@/config'
import type { CommandConfig } from '@/commands/types'
import { type Action, actions } from './actions'
import { down } from './down'
import { nuke } from './nuke'
import { run } from './run'
import { up } from './up'
import { existsSync } from 'fs'

const devboxConfigFileName = 'devbox.json'

async function handler(
  this: Command,
  action: string,
  options: Options
): Promise<void> {
  const context = createContext(this, action as Action, options)
  const {
    options: { verbose },
    args,
  } = context

  if (verbose) {
    chalk.draw(chalk.info(`Running box ${action} ${args.join(' ')}`))
  }

  if (!existsSync(devboxConfigFileName)) {
    chalk.draw(
      chalk.error(`No devbox config file found at ${devboxConfigFileName}.`)
    )
    return
  }

  switch (context.action) {
    case 'up':
      return up(context)
    case 'down':
      return down(context)
    case 'nuke':
      return nuke(context)
  }

  await run(context)
}

export const box: CommandConfig = (program: Command) => {
  return program
    .command('box')
    .summary('runs devbox commands')
    .description(
      `Interacts with ${chalk.primary(
        'devbox'
      )} to spin up the repository based on the contents of the ${chalk.secondary(
        configFileName
      )} file`
    )
    .option('-v, --verbose', 'prints commands being run')
    .allowUnknownOption()
    .argument(
      '<action>',
      `the action to run. Valid actions are: ${chalk.accent.bold(
        actions
      )} plus any custom actions defined in the ${chalk.secondary(
        configFileName
      )} file.
  ${chalk.accent.bold(
    'up'
  )} - starts the devbox environment up so that it's ready to work with.
  ${chalk.accent.bold(
    'down'
  )} - brings the devbox environment down so that no local resources are being used.
  ${chalk.accent.bold(
    'run'
  )} - runs a custom devbox command defined in the ${chalk.secondary(
        configFileName
      )} file (${chalk.primary('devbox.commands')}).
  ${chalk.accent.bold(
    'nuke'
  )} - erases all local ephemeral devbox data (run ${chalk.primary(
        'dev box up'
      )} after this)`
    )
    .action(handler)
}
