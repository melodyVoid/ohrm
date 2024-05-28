import chalk from 'chalk'
import ini from 'ini'
import { readFile } from 'node:fs/promises'
import { OHPMRC, OHRMRC, REGISTRIES, REGISTRY, SPACE } from './constants'

export async function readConfigFile(file: string) {
  try {
    const fileContent = await readFile(file, 'utf-8')
    const config = ini.parse(fileContent)
    return config
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}
    }
    exit(error)
  }
}

export async function getCurrentRegistry(): Promise<string> {
  const ohrmrc = await readConfigFile(OHPMRC)
  return ohrmrc[REGISTRY]
}

export async function getRegistries() {
  const customRegistries = await readConfigFile(OHRMRC)
  return Object.assign({}, REGISTRIES, customRegistries)
}

function padding(message = '', before = 1, after = 1) {
  return `${SPACE.repeat(before)}${message}${SPACE.repeat(after)}`
}

function printError(error) {
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
  } else {
    return !str1 && !str2
  }
}

export function exit(error: Error) {
  error && printError(error)
  process.exit(1)
}
