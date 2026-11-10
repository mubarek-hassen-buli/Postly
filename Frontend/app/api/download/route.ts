import fs from "node:fs"
import path from "node:path"
import { Readable } from "node:stream"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function resolveApkPath(): string | null {
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

export async function HEAD(): Promise<NextResponse> {
  const apkPath = resolveApkPath()
  if (!apkPath) {
    return NextResponse.json(
      { error: "NotFound", message: "Postly.apk file not found on server." },
      { status: 404 }
    )
  }

  const stat = await fs.promises.stat(apkPath)

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="Postly.apk"',
      "Content-Length": stat.size.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    },
  })
}

export async function GET(): Promise<NextResponse> {
  try {
    const apkPath = resolveApkPath()
    if (!apkPath) {
      return NextResponse.json(
        { error: "NotFound", message: "Postly.apk file not found on server." },
        { status: 404 }
      )
    }

    const stat = await fs.promises.stat(apkPath)
    const nodeStream = fs.createReadStream(apkPath)
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": 'attachment; filename="Postly.apk"',
        "Content-Length": stat.size.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "InternalServerError", message: "Failed to stream APK installer." },
      { status: 500 }
    )
  }
}

