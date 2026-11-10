import fs from "node:fs"
import path from "node:path"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getApkPath(): string | null {
  const candidates = [
    path.join(process.cwd(), "public", "apk", "Postly.apk"),
    path.join(process.cwd(), "Frontend", "public", "apk", "Postly.apk"),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

export async function HEAD(): Promise<Response> {
  const apkPath = getApkPath()
  if (!apkPath) {
    return new Response(JSON.stringify({ error: "APK file not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  const stat = await fs.promises.stat(apkPath)

  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="Postly.apk"',
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

export async function GET(): Promise<Response> {
  try {
    const apkPath = getApkPath()

    if (!apkPath) {
      return new Response(
        JSON.stringify({
          error: "NotFound",
          message: "Postly.apk file was not found on the server filesystem.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const blob = await fs.openAsBlob(apkPath)

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": 'attachment; filename="Postly.apk"',
        "Content-Length": String(blob.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("APK download error:", error)
    return new Response(
      JSON.stringify({
        error: "InternalServerError",
        message: error instanceof Error ? error.message : "Failed to serve APK file.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
