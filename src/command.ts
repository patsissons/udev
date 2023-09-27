import chalk from 'chalk'
import { Command } from 'commander'
import { textSync } from 'figlet'
import { commands, type CommandConfig } from './commands'
import type { GlobalOptions } from './config'
import { stringify } from './utils/string'
import { flagsForOptions } from './utils/flags'

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
      const globals = program.optsWithGlobals<GlobalOptions>()
      const { quiet, verbose } = globals

      if (!quiet) {
        chalk.draw(`${chalk.primary(textSync('μdev', 'Big'))}\n`)
      }

      if (verbose) {
        chalk.draw(
          chalk.info(
            `Running ${chalk.accent(
              `dev ${program.args.join(' ')} ${flagsForOptions(globals).join(
                ' '
              )}`
            )}`
          )
        )
      }
    })
    .on(
      'command:*',
      function (this: Command, [cmd, ...argv]: string[], userArgs: string[]) {
        const globals = this.optsWithGlobals<GlobalOptions>()
        const flags = flagsForOptions(globals)

        const inferredArgv = ['repo', cmd, ...flags, ...argv, ...userArgs]
        if (globals.verbose) {
          chalk.draw(
            chalk.info(
              `Inferring command ${chalk.accent(
                `dev ${inferredArgv.join(' ')}`
              )}`
            )
          )
        }
        this.parse(inferredArgv, { from: 'user' })
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
