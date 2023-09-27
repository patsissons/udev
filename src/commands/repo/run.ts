import chalk from 'chalk'
import { configFileName, type Context, type Step } from '@/config'
import { spawn } from '@/utils/runner'
import { stringify } from '@/utils/string'

export async function run(context: Context) {
  const { config, action, args } = context
  const name = action === 'run' ? args.shift() : action
  if (!name) {
    chalk.draw(chalk.error(`No command specified.`))
    return
  }

  if (!config) {
    chalk.draw(
      chalk.error(`No config file found at ${chalk.secondary(configFileName)}.`)
    )
    return
  }

  const { commands } = config

  if (!commands) {
    chalk.draw(
      chalk.error(`No commands found in ${chalk.secondary(configFileName)}.`)
    )
    return
  }

  let cmd = commands[name]
  if (!cmd) {
    chalk.draw(
      chalk.error(
        `Command ${chalk.primary.bold(name)} not found in ${chalk.secondary(
          configFileName
        )}.`
      )
    )
    return
  }

  if (typeof cmd === 'string') {
    await runCommandAndLog(context, cmd, ...args)
  } else {
    const { run, setup, args: argNames } = cmd
    if (setup && setup.length > 0) {
      for (const step of setup) {
        const [command] = replaceCommandArgs(step, args, argNames)
        await runCommandAndLog(context, command)
      }
    }

    const [command, ...restArgs] = replaceCommandArgs(run, args, argNames)
    await runCommandAndLog(context, command, ...restArgs)
  }
}

export function replaceCommandArgs(
  command: string,
  args: string[],
  argNames: string[] = []
) {
  return argNames.reduce(
    ([command, arg0, ...args], argName) => {
      if (!arg0) return [command]

      const pattern = new RegExp(`\\$\\{${argName}\\}`)
      return [command.replace(pattern, arg0), ...args]
    },
    [command, ...args]
  )
}

export async function runStep(context: Context, step: Step) {
  const {
    options: { verbose },
  } = context
  if (typeof step === 'string') {
    await runCommandAndLog(context, step)
    return
  }

  const { run, when, unless } = step

  if (when) {
    try {
      const { code } = await captureCommandAndLog(
        context,
        { silent: true },
        when
      )
      if (code !== 0) {
        if (verbose)
          chalk.draw(
            chalk.info(`Skipping ${run} because ${when} exited with ${code}`)
          )
        return
      }
    } catch (error) {
      chalk.draw(
        chalk.info(
          `Skipping ${run} because ${when} exited with ${stringify(
            error,
            'An unknown error occurred.'
          )}`
        )
      )
      return
    }
  }
  if (unless) {
    try {
      const { code } = await captureCommandAndLog(
        context,
        { silent: true },
        unless
      )
      if (code === 0) {
        if (verbose)
          chalk.draw(
            chalk.info(`Skipping ${run} because ${unless} exited with ${code}`)
          )
        return
      }
    } catch {
      // do nothing, we still want to run the command
    }
  }

  await runCommandAndLog(context, run)
}

export interface SpawnCommandAndLogOptions {
  detached?: boolean
  silent?: boolean
  onStdOut?: (data: string) => void
  onStdErr?: (data: string) => void
  onExit?: (code: number) => void
}

export async function spawnCommandAndLog(
  { config, options: { verbose } }: Context,
  { detached, silent, onStdOut, onStdErr, onExit }: SpawnCommandAndLogOptions,
  ...args: string[]
) {
  const cmd = args.shift()!

  if (verbose) chalk.draw(chalk.info.bold(cmd), args.join(' '), '\n')

  const spawnOptions = cmd.includes(' ') ? { shell: true, detached } : undefined
  process.on('SIGINFO', () => {
    if (!config?.open) return

    spawn('open', [config.open], { stdio: 'ignore', detached: true })
  })

  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      // inherit stdin so we can enter text into the process,
      // but pipe stdout and stderr so that they just get logged
      stdio: ['inherit', 'pipe', 'pipe'],
      ...spawnOptions,
    })
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (data) => {
      if (!data) return
      if (typeof data !== 'string') return
      if (silent) return

      const text = data.trim()
      if (!text || text === 'undefined' || text === 'null') return

      if (onStdOut) {
        onStdOut(text)
      } else {
        chalk.draw('\n', chalk.info(text))
      }
    })
    child.stderr.on('data', (data) => {
      if (!data) return
      if (typeof data !== 'string') return
      if (silent) return

      const text = data.trim()
      if (!text) return

      if (onStdErr) {
        onStdErr(text)
      } else {
        chalk.draw('\n', chalk.error(text))
      }
    })
    child.on('error', (error) => {
      if (error) {
        chalk.draw(chalk.error(stringify(error, 'Command run failed.')))
      }
      reject(error)
    })
    child.on('close', (code) => {
      if (verbose)
        chalk.draw(chalk.info(`child process exited with code ${code}`))
      onExit?.(code ?? -1)

      if (code === 0) {
        resolve()
      } else {
        reject('Command run failed.')
      }
    })
  })
}

export async function captureCommandAndLog(
  context: Context,
  arg1: string | SpawnCommandAndLogOptions,
  ...args: string[]
) {
  const output: string[] = []
  let code: number = -1

  if (typeof arg1 === 'string') {
    const options: SpawnCommandAndLogOptions = {
      onStdOut: handleOutput,
      onStdErr: handleOutput,
      onExit: handleExit,
    }

    await spawnCommandAndLog(context, options, arg1, ...args)
  } else {
    const options: SpawnCommandAndLogOptions = {
      ...arg1,
      onStdOut(data) {
        handleOutput(data)
        arg1.onStdOut?.(data)
      },
      onStdErr(data) {
        handleOutput(data)
        arg1.onStdErr?.(data)
      },
      onExit: handleExit,
    }

    await spawnCommandAndLog(context, options, ...args)
  }

  return { code, output }

  function handleOutput(data: string) {
    output.push(data)
  }

  function handleExit(value: number) {
    code = value
  }
}

export async function runCommandAndLog(
  context: Context,
  arg1: string | SpawnCommandAndLogOptions,
  ...args: string[]
) {
  if (typeof arg1 === 'string') {
    await spawnCommandAndLog(context, {}, arg1, ...args)
  } else {
    await spawnCommandAndLog(context, arg1, ...args)
  }
}
