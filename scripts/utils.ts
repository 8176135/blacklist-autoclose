import { resolve } from "path"
import { bgCyan, black } from "kolorist"
import { dirname } from "path"
import { fileURLToPath } from "url"

export const port = parseInt(process.env.PORT || "") || 4000
export const r = (...args: string[]) => resolve(dirname(fileURLToPath(import.meta.url)), "..", ...args)
export const isDev = process.env.NODE_ENV !== "production"

export function log(name: string, message: string) {
  console.log(black(bgCyan(` ${name} `)), message)
}