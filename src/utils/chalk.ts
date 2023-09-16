import chalk from 'chalk'

declare module 'chalk' {
  type ChalkThemeColour =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'base'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
  type ChalkTheme = Record<ChalkThemeColour, string>

  interface ChalkThemeable {
    readonly primary: Chalk
    readonly secondary: Chalk
    readonly accent: Chalk
    readonly base: Chalk
    readonly success: Chalk
    readonly info: Chalk
    readonly warning: Chalk
    readonly error: Chalk

    readonly theme: ChalkTheme
    setTheme(theme: ChalkTheme): Chalk
  }

  type ChalkDrawer = (this: Chalk, content: string, ...args: unknown[]) => void

  interface ChalkDrawable {
    draw(content: string, ...args: unknown[]): void
    draw(content: (chalk: Chalk) => string, ...args: unknown[]): void

    readonly drawer: ChalkDrawer
    setDrawer(drawer: ChalkDrawer): Chalk
  }

  interface Chalk extends ChalkThemeable, ChalkDrawable {}
}

function setup() {
  const customChalk: any = chalk

  customChalk.setTheme = (theme: chalk.ChalkTheme) => {
    customChalk.theme = theme
    customChalk.primary = chalk.hex(theme.primary)
    customChalk.secondary = chalk.hex(theme.secondary)
    customChalk.accent = chalk.hex(theme.accent)
    customChalk.base = chalk.hex(theme.base)
    customChalk.success = chalk.hex(theme.success)
    customChalk.info = chalk.hex(theme.info)
    customChalk.warning = chalk.hex(theme.warning)
    customChalk.error = chalk.hex(theme.error)

    return customChalk
  }

  customChalk.setDrawer = (drawer: chalk.ChalkDrawer) => {
    customChalk.drawer = drawer
  }

  customChalk.draw = function draw(
    this: chalk.Chalk,
    content: string | ((chalk: chalk.Chalk) => string),
    ...args: unknown[]
  ) {
    this.drawer(
      typeof content === 'function' ? content(this) : content,
      ...args
    )
  }

  return chalk
}

setup()
  .setTheme({
    primary: '#D926AA',
    secondary: '#661AE6',
    accent: '#1FB2A5',
    base: '#A6ADBB',
    success: '#36D399',
    info: '#3ABFF8',
    warning: '#FBBD23',
    error: '#F87272',
  })
  .setDrawer(console.log)
