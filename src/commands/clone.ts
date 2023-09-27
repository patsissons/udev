import { resolve } from 'path'
import chalk from 'chalk'
import { Command } from 'commander'
import { commandAction, type GlobalOptions } from '@/config'
import { srcBasePath } from '@/utils/path'
import {
  CommandAttempt,
  logCommandAttempt,
  runConditionalCommands,
} from '@/utils/runner'
import type { CommandConfig } from './types'

interface CloneOptions extends GlobalOptions {
  replace?: boolean
  http?: boolean
}

async function handler(this: Command, repo: string) {
  const context = commandAction(this, 'clone').createContext<CloneOptions>()
  const {
    options: { http, replace },
  } = context
  const fullRepo = composeFullRepo()
  if (!fullRepo) return

  const fullPath = resolve(srcBasePath, fullRepo)

  chalk.draw(
    `Cloning ${chalk.primary.bold(fullRepo)} into ${chalk.accent.bold(
      fullPath
    )}...\n`
  )

  const repoUri = `${
    http ? 'https://github.com/' : 'git@github.com:'
  }${fullRepo}.git`

  const success = await runConditionalCommands(
    {
      [`rm -rf ${fullPath}`]: replace,
      [`mkdir -p ${fullPath}`]: true,
      [`git clone ${repoUri} ${fullPath}`]: true,
    },
    handleResult
  )

  if (success) {
    chalk.draw(
      chalk.info(
        `${chalk.primary.bold(fullRepo)} cloned to ${chalk.accent.bold(
          fullPath
        )}`
      )
    )
  }

  function handleResult(result: CommandAttempt) {
    logCommandAttempt(result)

    return result.success
  }

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

export const clone: CommandConfig = (program: Command) => {
  return program
    .command('clone')
    .summary('clone a GitHub repository')
    .description(
      `clones a github repository into ${chalk.accent.bold(
        '~/src/github.com/<org>/<repo>'
      )}`
    )
    .option('-h, --http', 'clones using an http repo url instead of ssh')
    .option('-r, --replace', 'remove and replace any existing checkout')
    .option('-v, --verbose', 'prints commands being run')
    .argument(
      '<repo>',
      `repository to ${chalk.primary.bold(
        'clone'
      )} (e.g., ${chalk.secondary.bold('udev')} or ${chalk.secondary.bold(
        'patsissons/udev'
      )})`
    )
    .action(handler)
}
