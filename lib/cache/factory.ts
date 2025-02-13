import { CacheBackend } from "./types"
import { FileCacheBackend } from "./file"
import { VercelCacheBackend } from "./vercel"

export type CacheBackendType = "file" | "vercel"

export function createCacheBackend(type: CacheBackendType = "file"): CacheBackend {
  switch (type) {
    case "vercel":
      return new VercelCacheBackend()
    case "file":
    default:
      return new FileCacheBackend()
  }
} 