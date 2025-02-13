import fs from "fs/promises"
import path from "path"
import { createHash } from "crypto"
import { Plugin } from "../types"
import { CacheBackend } from "./types"

const CACHE_DIR = path.join(process.cwd(), ".cache")

export class FileCacheBackend implements CacheBackend {
  private getSha1Hash(str: string): string {
    return createHash("sha1").update(str).digest("hex")
  }

  private getFilePath(name: string): string {
    const hash = this.getSha1Hash(name)
    const subDir = hash.slice(0, 2)
    return path.join(CACHE_DIR, subDir, `${hash}.json`)
  }

  async get(name: string): Promise<Plugin | null> {
    const filePath = this.getFilePath(name)
    try {
      const content = await fs.readFile(filePath, "utf-8")
      return JSON.parse(content) as Plugin
    } catch (error) {
      return null
    }
  }

  async set(name: string, plugin: Plugin): Promise<void> {
    const filePath = this.getFilePath(name)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(plugin, null, 2))
  }

  async getAll(): Promise<Plugin[]> {
    try {
      await fs.access(CACHE_DIR)
    } catch {
      return []
    }

    const plugins: Plugin[] = []
    const dirs = await fs.readdir(CACHE_DIR)
    
    for (const dir of dirs) {
      const dirPath = path.join(CACHE_DIR, dir)
      const stat = await fs.stat(dirPath)
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(dirPath)
        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const content = await fs.readFile(path.join(dirPath, file), "utf-8")
              plugins.push(JSON.parse(content))
            } catch (error) {
              console.error(`Error reading cache file: ${file}`, error)
            }
          }
        }
      }
    }
    
    return plugins
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(CACHE_DIR, { recursive: true, force: true })
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  }
} 