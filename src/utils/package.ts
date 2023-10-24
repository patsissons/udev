import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

export const packagePath = resolve(__dirname, '../../package.json')
export const commitPath = resolve(__dirname, '../../COMMIT')

export function readPackageVersion() {
  const { name, version: pkgVersion } = JSON.parse(
    readFileSync(packagePath, 'utf8')
  ) as {
    name: string
    version: string
  }

  const version = existsSync(commitPath)
    ? `${pkgVersion}-${readFileSync(commitPath, 'utf8').trim()}`
    : pkgVersion

  return { name, version }
}
