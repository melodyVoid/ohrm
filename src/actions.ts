import chalk from 'chalk'
import open from 'open'
import {
  HOME,
  OHPMRC,
  OHRMRC,
  PUBLISH_REGISTRY,
  REGISTRY,
  SPACE,
} from './constants'
import {
  exit,
  geneDashLine,
  getCurrentRegistry,
  getRegistries,
  isInternalRegistry,
  isLowerCaseEqual,
  isRegistryNotFound,
  printError,
  printMessages,
  printSuccess,
  readConfigFile,
  writeConfigFile,
} from './helpers'
import type { Ohpmrc, Ohrmrc, Registry } from './types'

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

export async function onUse(name: string) {
  if (await isRegistryNotFound(name)) {
    return
  }

  const registries = await getRegistries()
  const registry = registries[name]
  const ohpmrc = (await readConfigFile<Ohpmrc>(OHPMRC))!
  await writeConfigFile(OHPMRC, { ...ohpmrc, ...registry })

  printSuccess(`The registry has been changed to '${name}'.`)
}

export async function onAdd(name: string, url: string, home?: string) {
  const registries = await getRegistries()
  const registryNames = Object.keys(registries)
  const registryUrls = registryNames.map(name => registries[name][REGISTRY])
  if (
    registryNames.includes(name) ||
    registryUrls.some(registryUrl => isLowerCaseEqual(registryUrl, url))
  ) {
    return exit(
      'The registry name or url is already included in the ohrm registries. Please make sure that the name and url are unique.',
    )
  }

  const newRegistry: Registry = { registry: '' }
  newRegistry[REGISTRY] = /\/$/.test(url) ? url : url + '/'
  if (home) {
    newRegistry[HOME] = home
  }
  const customRegistries = (await readConfigFile<Ohrmrc>(OHRMRC))!
  const newCustomRegistries = Object.assign(customRegistries, {
    [name]: newRegistry,
  })
  await writeConfigFile(OHRMRC, newCustomRegistries)
  printSuccess(
    `Add registry ${name} success, run ${chalk.green('ohrm use ' + name)} command to use ${name} registry.`,
  )
}

export async function onDelete(name: string) {
  if (
    (await isRegistryNotFound(name)) ||
    (await isInternalRegistry(name, 'delete'))
  ) {
    return
  }

  const customRegistries = (await readConfigFile<Ohrmrc>(OHRMRC))!
  const registry = customRegistries[name]
  delete customRegistries[name]
  await writeConfigFile(OHRMRC, customRegistries)
  printSuccess(`The registry '${name}' has been deleted successfully.`)

  const currentRegistry = await getCurrentRegistry()
  if (currentRegistry === registry[REGISTRY]) {
    await onUse('ohpm')
  }
}

export async function onSetPublish(name: string, publishRegistry: string) {
  if (
    (await isRegistryNotFound(name)) ||
    (await isInternalRegistry(name, 'set publish registry'))
  ) {
    return
  }

  const customRegistries = (await readConfigFile<Ohrmrc>(OHRMRC))!
  const registry = customRegistries[name]
  registry[PUBLISH_REGISTRY] = publishRegistry
  await writeConfigFile(OHRMRC, customRegistries)
  printSuccess(
    `Set the ${PUBLISH_REGISTRY} of registry '${name}' successfully.`,
  )

  const currentRegistry = await getCurrentRegistry()
  if (currentRegistry && currentRegistry === registry[REGISTRY]) {
    const ohpmrc = (await readConfigFile<Ohpmrc>(OHPMRC))!
    Object.assign(ohpmrc, { [PUBLISH_REGISTRY]: publishRegistry })
    await writeConfigFile(OHPMRC, ohpmrc)
    printSuccess(`Set repository attribute of ohrmrc successfully`)
  }
}

export async function onSetScope(scopeName: string, url: string) {
  const scopeRegistryKey = `${scopeName}:${REGISTRY}`
  if (!/^@/.test(scopeRegistryKey)) {
    printError('scope name must start with "@"')
    return
  }
  const ohpmrc = (await readConfigFile<Ohpmrc>(OHPMRC))!
  Object.assign(ohpmrc, { [scopeRegistryKey]: url })
  await writeConfigFile(OHPMRC, ohpmrc)
  printSuccess(`Set scope '${scopeRegistryKey}=${url}' success.`)
}

export async function onDeleteScope(scopeName: string) {
  const scopeRegistryKey = `${scopeName}:${REGISTRY}`
  const ohpmrc = (await readConfigFile<Ohpmrc>(OHPMRC))!
  if (!ohpmrc[scopeRegistryKey]) {
    printError(`The scope '${scopeRegistryKey}' is not found.`)
    return
  }
  delete ohpmrc[scopeRegistryKey]
  await writeConfigFile(OHPMRC, ohpmrc)
  printSuccess(`Delete scope '${scopeRegistryKey}' success.`)
}

export async function onRename(name: string, newName: string) {
  if (
    (await isRegistryNotFound(name)) ||
    (await isInternalRegistry(name, 'rename'))
  ) {
    return
  }
  if (name === newName) {
    return exit('The names cannot be the same.')
  }

  if (!(await isRegistryNotFound(newName, false))) {
    return exit(`The new registry name '${newName}' is already exist.`)
  }

  const customRegistries = (await readConfigFile<Ohrmrc>(OHRMRC))!
  customRegistries[newName] = JSON.parse(JSON.stringify(customRegistries[name]))
  delete customRegistries[name]
  await writeConfigFile(OHRMRC, customRegistries)
  printSuccess(`The registry '${name}' has been renamed to '${newName}'.`)
}

export async function onHome(name: string, browser: string) {
  if (await isRegistryNotFound(name)) {
    return
  }

  const registries = await getRegistries()
  if (!registries[name][HOME]) {
    return exit(`The homepage of registry '${name}' is not found.`)
  }
  open(registries[name][HOME], browser ? { app: { name: browser } } : undefined)
}