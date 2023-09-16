import chalk from 'chalk'
import { exec, ExecException, spawn, spawnSync } from 'child_process'
import { stringify } from './string'

export interface RunCommandOptions {
  verbose?: boolean
}
export interface CommandInfo {
  command: string
}
export interface CommandOutput {
  stdout: string
  stderr: string
}
export interface CommandSuccess extends CommandInfo, CommandOutput {
  success: true
}
export interface CommandError extends CommandInfo {
  success: false
  error: ExecException
}
export type CommandAttempt = CommandSuccess | CommandError

export { spawn, spawnSync }

export function runCommand(
  command: string,
  { verbose }: RunCommandOptions = {}
) {
  return new Promise<CommandOutput>((resolve, reject) => {
    if (verbose) chalk.draw(chalk.info.bold(command), '\n')

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

export async function tryRunCommand(
  command: string,
  options?: RunCommandOptions
): Promise<CommandAttempt> {
  try {
    const output = await runCommand(command, options)
    return { command, success: true, ...output }
  } catch (error) {
    return { command, success: false, error } as CommandAttempt
  }
}

export function logCommandAttempt(attempt: CommandAttempt) {
  if (attempt.success) {
    if (attempt.stderr)
      chalk.draw(
        chalk.error(stringify(attempt.stderr, 'An unknown error occurred.'))
      )
    if (attempt.stdout) chalk.draw(chalk.info(stringify(attempt.stdout)))
  } else {
    chalk.draw(
      chalk.error(stringify(attempt.error, 'An unknown error occurred.'))
    )
  }
}

export async function runCommandAndLog(
  command: string,
  options?: RunCommandOptions
) {
  const result = await tryRunCommand(command, options)

  logCommandAttempt(result)
}

export type OnCommandResult = (result: CommandAttempt) => unknown

export async function runCommands(
  commands: string[],
  onResult: OnCommandResult,
  options?: RunCommandOptions
) {
  for (const command of commands) {
    const result = await tryRunCommand(command, options)
    if (!onResult(result)) return false
  }

  return true
}

export function runConditionalCommands(
  commands: Record<string, unknown>,
  onResult: OnCommandResult,
  options?: RunCommandOptions
) {
  const enabled = Object.entries(commands)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([command]) => command)
  return runCommands(enabled, onResult, options)
}
