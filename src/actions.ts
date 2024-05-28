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

export async function onCurrent({ showUrl }: { showUrl: boolean }) {
  const currentRegistry = await getCurrentRegistry()
  let usingUnknownRegistry = true
  const registries = await getRegistries()
  for (const name in registries) {
    const registry = registries[name]
    if (isLowerCaseEqual(registry[REGISTRY], currentRegistry)) {
      usingUnknownRegistry = false
      printMessages([
        `You are using ${chalk.green(showUrl ? registry[REGISTRY] : name)} registry.`,
      ])
    }
  }
  if (usingUnknownRegistry) {
    printMessages([
      `Your current registry(${currentRegistry}) is not included in the ohrm registries.`,
      `Use the ${chalk.green('ohrm add <registry> <url> [home]')} command to add your registry.`,
    ])
  }
}

export function onUse() {}

export function onAdd() {}

export function onDelete() {}
