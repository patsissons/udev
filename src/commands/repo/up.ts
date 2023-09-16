import chalk from 'chalk'
import { lookpathSync } from 'find-bin'
import type {
  BrewConfig,
  Context,
  DockerConfig,
  HostsConfig,
  NodeConfig,
  NodePackager,
} from '@/config'
import { captureCommandAndLog, runCommandAndLog, runStep } from './run'

export async function up(context: Context) {
  const {
    config,
    options: { verbose },
  } = context

  if (!config?.up) {
    return configless()
  }

  const { brew, docker, hosts, node, steps } = config.up

  if (hosts) {
    await processHosts(hosts)
  }

  if (docker) {
    await processDocker(docker)
  }

  if (brew) {
    await processBrew(brew)
  }

  if (node) {
    await processNode(node)
  }

  if (steps && steps.length > 0) {
    for (const step of steps) {
      try {
        await runStep(context, step)
      } catch {
        break
      }
    }
  }

  async function processHosts({ removeLocalIpv6 }: HostsConfig) {
    if (removeLocalIpv6) {
      try {
        await runCommandAndLog(
          context,
          { silent: true },
          'grep',
          '^::1',
          '/etc/hosts'
        )

        chalk.draw(chalk.warning('Patching IPv6 entry in /etc/hosts (# ::1)'))
        await runCommandAndLog(
          context,
          'sudo',
          'sed',
          '-i',
          '-e',
          's/^::1/# ::1/g',
          '/etc/hosts'
        )
      } catch (e) {
        // IPv6 entry not enabled, so we can continue on
      }
    }
  }

  async function configless() {
    await installNode()
    await installPackages()
  }

  async function processDocker({}: DockerConfig) {
    // TODO: Check if docker is installed
    // TODO: Check if docker is running
    // TODO: Check if docker is correct version
  }

  async function processBrew({ install = [], cask }: BrewConfig) {
    if (!lookpathSync('brew')) {
      chalk.draw(chalk.warning('Homebrew not found, skipping brew installs'))
      return
    }

    if (node && node.version) {
      install.push('nvm')
    }

    if (install.length > 0) {
      await installBrew('formulae', install)
    }

    if (cask && cask.length > 0) {
      await installBrew('cask', cask)
    }
  }

  async function installBrew(type: 'formulae' | 'cask', items: string[]) {
    const flag = `--${type}`
    const { output: listOutput } = await captureCommandAndLog(
      context,
      'brew',
      'list',
      '-1',
      flag
    )
    const installed = new Set(listOutput.flatMap((line) => line.split('\n')))
    const { output: outdatedOutput } = await captureCommandAndLog(
      context,
      'brew',
      'outdated',
      '--quiet',
      flag
    )
    const outdated = outdatedOutput
      .flatMap((line) => line.split('\n'))
      .filter((item) => items.includes(item))
    const missing = items.filter((item) => !installed.has(item))
    if (verbose)
      chalk.draw(
        chalk.info(
          `Brew ${type}\n- missing: ${missing.join(
            ','
          )}\n- outdated: ${outdated.join(',')}\n- installed: ${Array.from(
            installed
          ).join(',')}`
        )
      )
    if (missing.length > 0) {
      await runCommandAndLog(context, 'brew', 'install', flag, ...missing)
    }
  }

  async function processNode({ version, packager }: NodeConfig) {
    await installNode(version)
    await installPackages(packager)
  }

  async function installNode(version?: string | number) {
    if (version) {
      if (verbose) {
        chalk.draw(
          chalk.warning(chalk.bold(`[WIP] Installing node ${version}`))
        )
      }
      // TODO: actually install node version
    }
  }

  async function installPackages(packager?: NodePackager) {
    if (packager) {
      await runCommandAndLog(context, packager, 'install')
    }
  }
}
