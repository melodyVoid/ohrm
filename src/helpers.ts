import chalk from 'chalk'
import ini from 'ini'
import { readFile, writeFile } from 'node:fs/promises'
import { OHPMRC, OHRMRC, REGISTRIES, REGISTRY, SPACE } from './constants'
import type { Ohpmrc, Ohrmrc } from './types'

export async function readConfigFile<T extends Record<string, unknown>>(
  file: string,
): Promise<T | undefined> {
  try {
    const fileContent = await readFile(file, 'utf-8')
    const config = ini.parse(fileContent)
    return config
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {} as T
    }
    exit(error)
  }
}

export async function writeConfigFile(
  path: string,
  content: Record<string, unknown>,
) {
  try {
    await writeFile(path, ini.stringify(content))
  } catch (error) {
    exit(error)
  }
}

export async function getCurrentRegistry(): Promise<string> {
  const ohrmrc = (await readConfigFile<Ohpmrc>(OHPMRC))!
  return ohrmrc[REGISTRY]
}

export async function getRegistries(): Promise<Ohrmrc> {
  const customRegistries = (await readConfigFile<Ohrmrc>(OHRMRC))!
  return Object.assign({}, REGISTRIES, customRegistries)
}

export async function isRegistryNotFound(name: string, printErr = true) {
  const registries = await getRegistries()
  if (!Object.keys(registries).includes(name)) {
    printErr && printError(`The registry '${name}' is not found.`)
    return true
  }
  return false
}

function padding(message = '', before = 1, after = 1) {
  return `${SPACE.repeat(before)}${message}${SPACE.repeat(after)}`
}

export function printSuccess(message) {
  console.log(chalk.bgGreenBright(padding('SUCCESS')) + ' ' + message)
}

export function printError(error) {
  const errorBadge = chalk.bgRed(padding('ERROR'))
  const errorMessage = chalk.red(error)
  console.error(`${errorBadge} ${errorMessage}`)
}

export function printMessages(messages: string[]) {
  for (const message of messages) {
    console.log(message)
  }
}

export function geneDashLine(message, length): string {
  const finalMessage = new Array(Math.max(2, length - message.length + 2)).join(
    '-',
  )
  return padding(chalk.dim(finalMessage))
}

export function isLowerCaseEqual(str1: string, str2: string): boolean {
  if (str1 && str2) {
    return str1.toLowerCase() === str2.toLowerCase()
  }
  return !str1 && !str2
}

export async function isInternalRegistry(name: string, handle) {
  if (Object.keys(REGISTRIES).includes(name)) {
    handle && printError(`You cannot ${handle} the ohrm internal registry.`)
    return true
  }
  return false
}

export function exit(error: Error | string) {
  error && printError(error)
  process.exit(1)
}
