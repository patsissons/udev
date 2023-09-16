export const actions = ['up', 'down', 'run', 'open', 'nuke'] as const
export type Action = (typeof actions)[number]
