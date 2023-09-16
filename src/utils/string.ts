export function stringify(value: unknown, defaultString = ''): string {
  if (typeof value === 'undefined') return defaultString
  if (typeof value === 'string') return value
  if (typeof value === 'function') return value.toString()
  if (typeof value === 'object') {
    if (!value) return defaultString
    if (value instanceof Error) return value.message
    if ('message' in value) return stringify(value.message)

    return JSON.stringify(value)
  }

  return String(value)
}
