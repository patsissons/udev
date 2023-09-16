import chalk from 'chalk'
import type { Command } from 'commander'
import { createContext, configFileName, type Options } from '@/config'
import type { CommandConfig } from '@/commands/types'
import { type Action, actions } from './actions'
import { down } from './down'
import { nuke } from './nuke'
import { open } from './open'
import { run } from './run'
import { up } from './up'

async function handler(this: Command, action: string, options: Options) {
  const context = createContext(this, action as Action, options)
  const {
    options: { verbose },
    args,
  } = context

  if (verbose) {
    chalk.draw(chalk.info(`Running repo ${action} ${args.join(' ')}`))
  }

  switch (context.action) {
    case 'up':
      return up(context)
    case 'down':
      return down(context)
    case 'open':
      return open(context)
    case 'nuke':
      return nuke(context)
  }

  await run(context)
}

export const repo: CommandConfig = (program: Command) => {
  return program
    .command('repo')
    .summary('runs repository commands')
    .description(
      `Runs a command in a repository based on the contents of the ${chalk.secondary(
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
  )} - starts the repository up so that it's ready to work with.
  ${chalk.accent.bold(
    'down'
  )} - brings the repository down so that no local resources are being used.
  ${chalk.accent.bold(
    'run'
  )} - runs a custom command defined in the ${chalk.secondary(
        configFileName
      )} file.
  ${chalk.accent.bold('open')} - opens the ${chalk.secondary(
        'open'
      )} URL as defined in the ${chalk.secondary(
        configFileName
      )} file (shortcut: ${chalk.primary('CTRL+t')}).
  ${chalk.accent.bold(
    'nuke'
  )} - erases all local ephemeral data (run ${chalk.primary(
        'dev up'
      )} after this)`
    )
    .action(handler)
}
