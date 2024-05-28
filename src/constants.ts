import path from 'node:path'
export { default as REGISTRIES } from '../registries.json'

export const HOME = 'home'
export const SPACE = ' '
export const REGISTRY = 'registry'

export const OHPMRC = path.join(
  process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']!,
  '.ohpm/.ohpmrc',
)

export const OHRMRC = path.join(
  process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']!,
  '.ohrmrc',
)
