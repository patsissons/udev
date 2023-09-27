import kebabCase from 'lodash/kebabCase'
import type { GlobalOptions } from '@/config'

export function flagsForOptions<T extends GlobalOptions>(options: T) {
  return Object.entries(options).reduce((list, [key, value]) => {
    const name = flagName()
    const flag = value === false ? `--no-${name}` : `--${name}`

    return list.concat(
      typeof value === 'boolean'
        ? flag
        : `${flag}="${String(value).replace(/^["']/, '').replace(/["']$/, '')}"`
    )

    function flagName() {
      switch (key) {
        default:
          return kebabCase(key)
      }
    }
  }, [] as string[])
}
