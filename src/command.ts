import { Command } from 'commander'
import { commands } from './commands'
import { CommandConfig } from './commands/types'
import chalk from 'chalk'
import { textSync } from 'figlet'
import { stringify } from './utils/string'

interface GlobalOptions {
  quiet?: boolean
  verbose?: boolean
}

function createProgram() {
  const program = new Command()

  return program
    .name('μdev')
    .option('-q, --quiet', 'suppress ancillary output')
    .option('-v, --verbose', 'enable verbose output')
    .allowUnknownOption()
    .allowExcessArguments()
    .summary('μdev tool')
    .description(
      chalk.secondary(
        'the μdev CLI tool for simplifying common development tasks'
      )
    )
    .hook('preAction', (program) => {
      if (!program.opts<GlobalOptions>().quiet) {
        chalk.draw(`${chalk.primary(textSync('μdev', 'Big'))}\n`)
      }
    })
    .on(
      'command:*',
      function (this: Command, [cmd, ...argv]: string[], args: string[]) {
        const { verbose = false, quiet = false } = this.optsWithGlobals()
        const flags: string[] = []
        if (verbose) flags.push('--verbose')
        if (quiet) flags.push('--quiet')

        return this.commands
          .find((c) => c.name() === 'repo')
          ?.parse([...flags, cmd, '--', ...argv, ...args], {
            from: 'user',
          })
      }
    )
}

export async function run() {
  try {
    await Object.values(commands)
      .reduce(addCommand, createProgram())
      .parseAsync()
  } catch (error) {
    chalk.draw(chalk.error(stringify(error, 'An unknown error occurred.')))
  }

  function addCommand(program: Command, config: CommandConfig) {
    config(program)

    return program
  }
}
