import chalk from 'chalk'
import { REGISTRY, SPACE } from './constants'
import {
  geneDashLine,
  getCurrentRegistry,
  getRegistries,
  isLowerCaseEqual,
  printMessages,
} from './helpers'

export async function onList() {
  const currentRegistry = await getCurrentRegistry()
  const registries = await getRegistries()
  const registryName = Object.keys(registries)
  const length = Math.max(...registryName.map(name => name.length)) + 3

  const messages = registryName.map(name => {
    const registry = registries[name]
    const prefix = isLowerCaseEqual(registry[REGISTRY], currentRegistry)
      ? chalk.green.bold('* ')
      : SPACE.repeat(2)
    return `${prefix}${name}${geneDashLine(name, length)}${registry[REGISTRY]}`
  })

  printMessages(messages)
}

export function onCurrent() {}

export function onUse() {}

export function onAdd() {}

export function onDelete() {}
