import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://api.cizgibutik.com"

const CACHE_DIR = path.join(os.tmpdir(), "cizgibutik-hero-media")

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".mp4" || ext === ".m4v") return "video/mp4"
  if (ext === ".mov") return "video/quicktime"
  if (ext === ".webm") return "video/webm"
  if (ext === ".png") return "image/png"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".webp") return "image/webp"
  if (ext === ".gif") return "image/gif"
  if (ext === ".svg") return "image/svg+xml"
  return "application/octet-stream"
}

async function ensureCachedFile(safeFilename: string): Promise<string | null> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  const localPath = path.join(CACHE_DIR, safeFilename)
  if (fs.existsSync(localPath)) {
    const stat = fs.statSync(localPath)
    if (stat.size > 0) {
      return localPath
    }
  }

  const urlsToTry = [
    `${BACKEND_URL}/uploads/${encodeURIComponent(safeFilename)}`,
    `https://api.cizgibutik.com/uploads/${encodeURIComponent(safeFilename)}`,
  ]

  for (const targetUrl of Array.from(new Set(urlsToTry))) {
    try {
      const res = await fetch(targetUrl, { cache: "no-store" })
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer()
        if (arrayBuf.byteLength > 0) {
          fs.writeFileSync(localPath, Buffer.from(arrayBuf))
          return localPath
        }
      }
    } catch {}
  }

  return null
}

export async function HEAD(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params
  const safeFilename = path.basename(decodeURIComponent(filename || ""))
  if (!safeFilename) {
    return new Response(null, { status: 400 })
  }

  const localPath = await ensureCachedFile(safeFilename)
  if (!localPath) {
    return new Response(null, { status: 404 })
  }

  const fileSize = fs.statSync(localPath).size
  const contentType = getMimeType(safeFilename)

  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store, no-transform",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params
  const safeFilename = path.basename(decodeURIComponent(filename || ""))
  if (!safeFilename) {
    return new Response("Invalid filename", { status: 400 })
  }

  const localPath = await ensureCachedFile(safeFilename)
  if (!localPath) {
    return new Response("Not found", { status: 404 })
  }

  const fileSize = fs.statSync(localPath).size
  const contentType = getMimeType(safeFilename)
  const range = req.headers.get("range")

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const requestedEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const end = Math.min(requestedEnd, fileSize - 1)

    if (isNaN(start) || isNaN(end) || start >= fileSize || start > end || start < 0) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "private, no-store, no-transform",
        },
      })
    }

    const chunkLength = end - start + 1
    const buffer = Buffer.alloc(chunkLength)
    const fd = fs.openSync(localPath, "r")
    try {
      fs.readSync(fd, buffer, 0, chunkLength, start)
    } finally {
      fs.closeSync(fd)
    }

    return new Response(buffer, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": String(chunkLength),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store, no-transform",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }

  const fullBuffer = fs.readFileSync(localPath)
  return new Response(fullBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store, no-transform",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
