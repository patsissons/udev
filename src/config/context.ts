import type { Command } from 'commander'
import type { Context, GlobalOptions } from './types'
import { parseConfig } from './parse'

export function commandAction<Action extends string>(
  command: Command,
  action: Action
) {
  const partial = {
    command,
    action,
    // the first argument is the action, so we slice it off
    args: command.args.slice(1),
  }

  return {
    ...partial,
    createContext<Options extends GlobalOptions>(
      options = command.optsWithGlobals<Options>()
    ): Context<Options, Action> {
      return {
        ...partial,
        config: parseConfig(options),
        options,
      }
    },
  }
}
