import { Command } from 'commander'

export type CommandConfig = (cmd: Command) => Command
