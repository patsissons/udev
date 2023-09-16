import { resolve } from 'path'
import { homedir } from 'os'

export const srcBasePath = resolve(
  process.env.HOME ?? homedir(),
  'src/github.com'
)
