import chalk from 'chalk'
import { lookpathSync } from 'find-bin'
import type { Context } from '@/config'

export async function up(context: Context) {
  chalk.draw(chalk.warning('Not yet implemented'))

  const {
    options: { verbose },
  } = context

  await installDevbox()
  await startShell()

  async function installDevbox() {
    if (verbose) {
      chalk.draw(chalk.info('Checking if devbox is installed...'))
    }

    if (lookpathSync('devbox')) {
      if (verbose) {
        chalk.draw(chalk.info('devbox is already installed.'))
      }

      // TODO: update devbox?
      await Promise.resolve()

      return
    }

    if (verbose) {
      chalk.draw(
        chalk.info('No devbox installation found, installing devbox...')
      )
    }

    // TODO: Implement this
    await Promise.resolve()
  }

  async function startShell() {
    if (verbose) {
      chalk.draw(chalk.info('Starting devbox shell...'))
    }

    // TODO: Implement this
    await Promise.resolve()
  }
}
