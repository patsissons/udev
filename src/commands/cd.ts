import { existsSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import { Command } from 'commander'
import { commandAction, type GlobalOptions } from '@/config'
import { srcBasePath } from '@/utils/path'
import { spawnSync } from '@/utils/runner'
import type { CommandConfig } from './types'

export interface CdOptions extends GlobalOptions {
  print?: boolean
}

async function handler(this: Command, repo: string) {
  const context = commandAction(this, 'cd').createContext<CdOptions>()
  const {
    options: { verbose, print },
  } = context
  const fullRepo = composeFullRepo()
  if (!fullRepo) return

  const fullPath = resolve(srcBasePath, fullRepo)

  if (verbose) chalk.draw(chalk.info.bold(`stat ${fullPath}`), '\n')
  if (!existsSync(fullPath)) {
    chalk.draw(
      chalk.error(
        `Repository ${chalk.primary.bold(
          fullRepo
        )} does not exist. Please clone it first with ${chalk.accent.bold(
          `dev clone ${repo}`
        )}.`
      )
    )
    return
  }

  if (print) {
    chalk.draw(fullPath)
    return
  }

  if (verbose) chalk.draw(chalk.info.bold(`cd ${fullPath}`), '\n')
  spawnSync(process.env.SHELL ?? 'sh', {
    cwd: fullPath,
    stdio: 'inherit',
  })

  function composeFullRepo() {
    let [org, name] = repo.split('/')
    if (!name) {
      name = org
      const { defaultOrg } = context.config?.user || {}
      if (!defaultOrg) {
        chalk.draw(
          chalk.error(
            `No default org set. Please set ${chalk.secondary.bold(
              'defaultOrg'
            )} in ${chalk.primary.bold(
              '~/.dev.yml'
            )} or provide one as part of the repo name.`
          )
        )
        return
      }
      org = defaultOrg
    }

    return [org, name].join('/')
  }
}

export const cd: CommandConfig = (program: Command) => {
  return program
    .command('cd')
    .summary('open repository directory')
    .description(
      `changes directory to the cloned repository (${chalk.accent.bold(
        '~/src/github.com/<org>/<repo>'
      )})`
    )
    .option('-v, --verbose', 'prints commands being run')
    .option(
      '-p, --print',
      'prints the path to the cloned repository without changing directory'
    )
    .argument(
      '<repo>',
      `repository to change to (e.g., ${chalk.secondary.bold(
        'udev'
      )} or ${chalk.secondary.bold('patsissons/udev')})`
    )
    .action(handler)
}
