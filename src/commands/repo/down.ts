import type { Context } from '@/config'
import { runStep } from './run'

export async function down(context: Context) {
  const { config } = context
  if (!config?.down) return

  const { steps } = config.down

  if (steps && steps.length > 0) {
    for (const step of steps) {
      try {
        await runStep(context, step)
      } catch {
        break
      }
    }
  }
}
