import type { Command } from 'commander'

export type NodePackager = 'npm' | 'yarn' | 'pnpm'
export type RunnableCommand =
  | string
  | { run: string; aliases?: string[]; setup?: string[]; args?: string[] }
export type Step = string | { run: string; when?: string; unless?: string }

export interface HostsConfig {
  entries?: Record<string, string>
  removeLocalIpv6?: boolean
}

export interface DockerConfig {
  enabled?: boolean
}

export interface BrewConfig {
  install?: string[]
  cask?: string[]
}

export interface NodeConfig {
  version?: string | number
  packager?: NodePackager
}

export interface UserConfig {
  defaultOrg?: string
}

export interface UpConfig {
  hosts?: HostsConfig
  docker?: DockerConfig
  brew?: BrewConfig
  node?: NodeConfig
  steps?: Step[]
}

export interface DownConfig {
  steps?: Step[]
}

export interface NukeConfig {
  process?: string
  containers?:
    | {
        engine?: string
        name?: string
        prune?: boolean
      }
    | boolean
  git?: boolean
}

export interface Config {
  user?: UserConfig
  up?: UpConfig
  down?: DownConfig
  nuke?: NukeConfig
  commands?: Record<string, RunnableCommand>
  open?: string
}

export interface Options extends Record<string, unknown> {
  verbose?: boolean
}

export interface Context<
  Action = string,
  ActionOptions extends Options = Options
> {
  command: Command
  config?: Config
  action: Action
  options: ActionOptions
  args: string[]
}
