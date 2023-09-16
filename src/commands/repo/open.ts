import type { Context } from '@/config'
import { runCommandAndLog } from './run'

export async function open(context: Context) {
  const { config } = context
  if (!config?.open) return

  await runCommandAndLog(context, 'open', config.open)
}
