import { box } from './box'
import { cd } from './cd'
import { clone } from './clone'
import { ping } from './ping'
import { repo } from './repo'
import { CommandConfig } from './types'
import { update } from './update'
import { version } from './version'

export const commands: Record<string, CommandConfig> = {
  box,
  cd,
  clone,
  ping,
  repo,
  update,
  version,
}
