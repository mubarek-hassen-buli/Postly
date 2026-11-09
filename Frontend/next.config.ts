import fs from "node:fs"
import type { NextConfig } from "next"

const canonicalRoot = fs.realpathSync.native(process.cwd())

const nextConfig: NextConfig = {
  turbopack: {
    root: canonicalRoot,
  },
}

export default nextConfig
