import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// Todos os arquivos de uma pasta, recursivamente.
export const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  )
