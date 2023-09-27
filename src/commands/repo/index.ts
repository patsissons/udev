import chalk from 'chalk'
import type { Command } from 'commander'
import { commandAction, configFileName } from '@/config'
import type { CommandConfig } from '@/commands/types'
import { type Action, actions } from './actions'
import { down } from './down'
import { type RepoNukeOptions, nuke } from './nuke'
import { open } from './open'
import { run } from './run'
import { type RepoUpOptions, up } from './up'

export type RepoOptions = RepoUpOptions | RepoNukeOptions

async function handler(this: Command, action: Action) {
  const context = commandAction(this, action).createContext<RepoOptions>()

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
    .option(
      '-C, --no-configless',
      `${chalk.accent.bold('up')}: disables running in configless mode`
    )
    .option(
      '-H, --no-hosts',
      `${chalk.accent.bold('up')}: omits patching hosts`
    )
    .option(
      '-D, --no-docker',
      `${chalk.accent.bold('up')}: omits initializing docker`
    )
    .option(
      '-B, --no-brew',
      `${chalk.accent.bold('up')}: omits running brew commands`
    )
    .option(
      '-N, --no-node',
      `${chalk.accent.bold('up')}: omits setting up node`
    )
    .option(
      '-P, --no-process',
      `${chalk.accent.bold('nuke')}: omits checking for running processes`
    )
    .option(
      '-PC, --no-container',
      `${chalk.accent.bold('nuke')}: omits prunning running containers`
    )
    .option(
      '-G, --no-git',
      `${chalk.accent.bold('nuke')}: omits cleaning untracked git files`
    )
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
