import chalk from 'chalk'
import type { Command } from 'commander'
import type { CommandConfig } from './types'

export const ping: CommandConfig = (program: Command) => {
  return program
    .command('ping')
    .summary('test this dev tool')
    .description(`confirms the ${chalk.primary.bold('dev')} tool is working`)
    .action(handler)
}

function handler() {
  chalk.draw(chalk.secondary.bold('PONG'))
}
