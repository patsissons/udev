import type { Command } from 'commander'
import merge from 'lodash/merge'
import type { Context, Options } from './types'
import { parseConfig } from './parse'

export function createContext<Action, ActionOptions extends Options>(
  command: Command,
  action: Action,
  options: ActionOptions
): Context<Action, ActionOptions> {
  return {
    command,
    action: action,
    config: parseConfig(options),
    options: merge(command.parent?.opts(), options) as ActionOptions,
    args: command.args.slice(1),
  }
}
