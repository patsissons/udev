import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import type { IPackageJson } from 'package-json-type'
import chalk from 'chalk'
import { load } from 'js-yaml'
import isNil from 'lodash/isNil'
import merge from 'lodash/merge'
import omitBy from 'lodash/omitBy'
import { stringify } from '@/utils/string'
import type {
  RunnableCommand,
  Config,
  NodePackager,
  UserConfig,
  GlobalOptions,
} from './types'
import { configFileName } from './constants'

export function parseConfig({
  configPath,
  verbose,
}: GlobalOptions): Config | undefined {
  try {
    const config = loadConfig()

    if (!config.up) {
      config.up = {}
    }

    if (!config.up.node) {
      config.up.node = {}
    }

    if (!config.up.node.version) {
      if (existsSync('.nvmrc')) {
        config.up.node.version = readFileSync('.nvmrc', 'utf8').trim()
      }
    }

    if (!config.up.node.packager) {
      if (existsSync('yarn.lock')) {
        config.up.node.packager = 'yarn'
      } else if (existsSync('package-lock.json')) {
        config.up.node.packager = 'npm'
      } else if (existsSync('pnpm-lock.yaml')) {
        config.up.node.packager = 'pnpm'
      }
    }

    if (config.commands) {
      const commands = config.commands

      for (const cmd of Object.values(commands)) {
        if (typeof cmd !== 'string' && cmd.aliases && cmd.aliases.length > 0) {
          const { aliases, ...cmdWithoutAliases } = cmd
          cmd.aliases.forEach((alias) => {
            commands[alias] = cmdWithoutAliases
          })
        }
      }

      if (!config.commands.server) {
        if (existsSync(resolve('package.json'))) {
          const packageJson = readFileSync('package.json', 'utf8')
          const packageConfig = JSON.parse(packageJson) as IPackageJson
          const packager: NodePackager = config.up.node.packager || 'npm'

          if (packageConfig.scripts) {
            const script = 'dev' in packageConfig.scripts ? 'dev' : 'start'
            const cmd: RunnableCommand | undefined =
              'dev' in packageConfig.scripts || 'start' in packageConfig.scripts
                ? {
                    run: `${packager} run ${script}`,
                  }
                : undefined

            if (cmd) {
              config.commands.server = cmd
              config.commands.serve = cmd
              config.commands.s = cmd

              if ('dev' in packageConfig.scripts) {
                config.commands.dev = cmd
              } else if ('start' in packageConfig.scripts) {
                config.commands.start = cmd
              }
            }
          }
        }
      }
    }

    return config
  } catch (error) {
    if (verbose)
      chalk.draw(chalk.error(stringify(error, 'An unknown error occurred.')))
  }

  function loadConfig(): Config {
    const userPath = resolve(
      process.env.DEV_HOME || process.env.HOME || '~/',
      `.${configFileName}`
    )
    const userYaml = existsSync(userPath)
      ? readFileSync(userPath, 'utf8')
      : undefined
    const userConfig = userYaml
      ? omitBy(load(userYaml) as UserConfig, isNil)
      : undefined

    const path = resolve(configPath || configFileName)
    const hasConfig = existsSync(path)
    if (!hasConfig) {
      if (verbose) chalk.draw(chalk.warning(`No ${path} found.`))
      return userConfig ? { user: userConfig } : {}
    }

    if (verbose) chalk.draw(chalk.info.bold(`loading ${path}`))
    const yaml = readFileSync(path, 'utf8')
    const config = omitBy(load(yaml) as Config, isNil) as Config

    if (userConfig) {
      config.user = merge(userConfig, config.user)
    }

    return { configPath: path, ...config }
  }
}
