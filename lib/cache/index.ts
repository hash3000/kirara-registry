import { fetchPyPIInfo } from "../pypi"
import { Plugin } from "../types"
import { createCacheBackend } from "./factory"

const CACHE_BACKEND = process.env.CACHE_BACKEND || "file"
const cache = createCacheBackend(CACHE_BACKEND as "file" | "vercel")

const memoryCache = new Map<string, Plugin>()
const locks = new Map<string, Promise<void>>()

/**
 * 构建缓存
 */
export async function buildCache(): Promise<void> {
    const plugins = await cache.getAll()
    for (const plugin of plugins) {
        memoryCache.set(plugin.name, plugin)
    }
    console.log(`Loaded ${memoryCache.size} plugins into memory cache.`)
}

/**
 * 获取缓存的插件信息
 */
export async function getCachedPlugin(name: string): Promise<Plugin | null> {
    if (memoryCache.has(name)) {
        return memoryCache.get(name)!
    }

    const plugin = await cache.get(name)
    if (plugin) {
        memoryCache.set(name, plugin)
        return plugin
    }

    return null
}

/**
 * 刷新单个插件的缓存
 */
export async function refreshCache(name: string): Promise<void> {
    if (locks.has(name)) {
        await locks.get(name)
        return
    }

    const lock = (async () => {
        try {
            const plugins = await cache.getAll()
            const plugin = plugins.find((p) => p.name === name)
            if (!plugin) {
                throw new Error(`Plugin ${name} not found`)
            }

            const pypiInfo = await fetchPyPIInfo(plugin.pypiPackage)
            const pluginWithPyPIInfo: Plugin = { ...plugin, pypiInfo }

            memoryCache.set(name, pluginWithPyPIInfo)
            await cache.set(name, pluginWithPyPIInfo)
        } finally {
            locks.delete(name)
        }
    })()

    locks.set(name, lock)
    await lock
}

/**
 * 刷新所有插件的缓存
 */
export async function refreshAllCaches(): Promise<void> {
    const plugins = await cache.getAll()
    await Promise.all(plugins.map((plugin) => refreshCache(plugin.name)))
}

/**
 * 搜索插件
 */
export async function searchPlugins(query: string, page: number, pageSize: number): Promise<{
    plugins: Plugin[]
    totalCount: number
    totalPages: number
    page: number
    pageSize: number
}> {
    const plugins = Array.from(memoryCache.values())

    // 如果 query 为空，直接使用所有插件；否则进行过滤
    const filteredPlugins = query
        ? plugins.filter(
            (plugin) =>
                plugin.name.toLowerCase().includes(query.toLowerCase()) ||
                plugin.description.toLowerCase().includes(query.toLowerCase()),
        )
        : plugins

    // 分页处理
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedPlugins = filteredPlugins.slice(startIndex, endIndex)

    return {
        plugins: paginatedPlugins,
        totalCount: filteredPlugins.length,
        totalPages: Math.ceil(filteredPlugins.length / pageSize),
        page,
        pageSize,
    }
} 