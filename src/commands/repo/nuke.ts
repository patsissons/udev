import chalk from 'chalk'
import type { Context, GlobalOptions } from '@/config'
import { captureCommandAndLog, runCommandAndLog } from './run'
import { down } from './down'

export interface RepoNukeOptions extends GlobalOptions {
  process?: boolean
  containers?: boolean
  git?: boolean
}

export async function nuke(context: Context<RepoNukeOptions>) {
  chalk.draw(chalk.info('Stopping stack...'))
  await down(context)

  const { config: { nuke = {} } = {}, options } = context
  const { containers, git, process } = nuke

  if (process && options.process) {
    await checkForRunningProcesses(process)
  }

  if (containers && options.containers) {
    const { name = undefined, prune = undefined } =
      containers === true ? {} : containers
    await stopContainers(name)

    if (prune) {
      await dockerSystemPrune()
    }
  }

  if (git && options.git) {
    await gitCleanUntracked()
  }

  chalk.draw(
    chalk.info(
      chalk.bold(
        `\n\n🎉🎉🎉 Project environment nuked! run ${chalk.primary(
          'dev up'
        )} to start fresh. 🎉🎉🎉\n\n`
      )
    )
  )

  async function checkForRunningProcesses(process: string) {
    chalk.draw(chalk.info(`Checking for running ${process} processes...`))
    const { output } = await captureCommandAndLog(
      context,
      `ps -ef | grep -i '[${process[0]}]${process.slice(1)}' || exit 0`
    )
    if (output.length > 0) {
      chalk.draw(
        chalk.warning(
          `⚠️ Running ${process} processes detected!\nPlease manually kill any processes listed below with \`kill -9 <pid>\``
        )
      )
      output.filter(Boolean).forEach((line) => chalk.draw(line))

      throw new Error(`Running ${process} processes detected! Cannot continue.`)
    }
  }

  async function stopContainers(name?: string) {
    chalk.draw(chalk.info('Stopping all remaining containers...'))
    const { output: containerIds } = await captureCommandAndLog(
      context,
      'docker ps -aq'
    )

    if (containerIds.length > 0) {
      await runCommandAndLog(context, `docker rm -f ${containerIds.join(' ')}`)
    }

    chalk.draw(chalk.info('Checking for zombie containers...'))
    let processFilter = `[d]ocker`
    if (name) {
      processFilter += `|${name}`
    }
    const { output } = await captureCommandAndLog(
      context,
      `ps -ef | grep -i '${processFilter}' || exit 0`
    )
    if (output.length > 0) {
      chalk.draw(
        chalk.warning(
          '⚠️ Zombie containers detected!\nPlease manually kill any processes listed below'
        )
      )
      output.filter(Boolean).forEach((line) => chalk.draw(line))

      throw new Error('Zombie containers detected! Cannot continue.')
    }
  }

  async function dockerSystemPrune() {
    await runCommandAndLog(
      context,
      'docker system prune --all --volumes --force'
    )
  }

  async function gitCleanUntracked() {
    await runCommandAndLog(context, 'git clean -dxf')
  }
}
