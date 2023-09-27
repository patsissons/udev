import type { Command } from 'commander'

export type CommandConfig = (cmd: Command) => Command
