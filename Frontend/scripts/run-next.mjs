import fs from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"

const canonicalCwd = fs.realpathSync.native(process.cwd())
process.chdir(canonicalCwd)

const nextBin = path.join(
  canonicalCwd,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
)
const args = process.argv.slice(2)

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: canonicalCwd,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PRIVATE_DEV_DIR: canonicalCwd,
  },
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
  } else {
    process.exit(code ?? 0)
  }
})

