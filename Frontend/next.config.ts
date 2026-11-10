import fs from "node:fs"
import type { NextConfig } from "next"

const canonicalRoot = fs.realpathSync.native(process.cwd())

const nextConfig: NextConfig = {
  turbopack: {
    root: canonicalRoot,
  },
  async headers() {
    return [
      {
        source: "/apk/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/vnd.android.package-archive",
          },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Postly.apk"',
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
    ]
  },
}

export default nextConfig
