import type { GlobalOptions } from '@/config'

export function flagsForOptions<T extends GlobalOptions>(options: T) {
  return Object.entries(options).reduce((list, [flag, value]) => {
    return list.concat(value ? `--${flagName()}` : `--no-${flagName()}`)

    function flagName() {
      switch (flag) {
        default:
          return flag
      }
    }
  }, [] as string[])
}
