export const actions = ['up', 'down', 'run', 'nuke'] as const
export type Action = (typeof actions)[number]
