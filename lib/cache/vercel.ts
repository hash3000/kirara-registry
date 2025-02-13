import { put, del, list, get } from '@vercel/blob'
import { Plugin } from "../types"
import { CacheBackend } from "./types"

const PLUGIN_PREFIX = "plugins/"
const PLUGIN_LIST_FILE = "plugins/list.json"

export class VercelCacheBackend implements CacheBackend {
    private getKey(name: string): string {
        return `${PLUGIN_PREFIX}${name}.json`
    }

    async get(name: string): Promise<Plugin | null> {
        try {
            const blob = await get(this.getKey(name))
            if (!blob) return null
            const text = await blob.text()
            return JSON.parse(text) as Plugin
        } catch (error) {
            console.error(`Error getting plugin ${name}:`, error)
            return null
        }
    }

    async set(name: string, plugin: Plugin): Promise<void> {
        // 保存插件数据
        await put(this.getKey(name), JSON.stringify(plugin), {
            access: 'public',
            addRandomSuffix: false
        })

        // 更新插件列表
        let pluginNames: string[] = []
        try {
            const listBlob = await get(PLUGIN_LIST_FILE)
            if (listBlob) {
                const text = await listBlob.text()
                pluginNames = JSON.parse(text)
            }
        } catch (error) {
            console.error("Error reading plugin list:", error)
        }

        if (!pluginNames.includes(name)) {
            pluginNames.push(name)
            await put(PLUGIN_LIST_FILE, JSON.stringify(pluginNames), {
                access: 'public',
                addRandomSuffix: false
            })
        }
    }

    async getAll(): Promise<Plugin[]> {
        try {
            const listBlob = await get(PLUGIN_LIST_FILE)
            if (!listBlob) return []

            const text = await listBlob.text()
            const pluginNames = JSON.parse(text) as string[]

            const plugins = await Promise.all(
                pluginNames.map(name => this.get(name))
            )

            return plugins.filter((plugin): plugin is Plugin => plugin !== null)
        } catch (error) {
            console.error("Error getting all plugins:", error)
            return []
        }
    }

    async clear(): Promise<void> {
        try {
            const listBlob = await get(PLUGIN_LIST_FILE)
            if (!listBlob) return

            const text = await listBlob.text()
            const pluginNames = JSON.parse(text) as string[]

            // 删除所有插件文件
            await Promise.all(
                pluginNames.map(name => del(this.getKey(name)))
            )

            // 删除插件列表
            await del(PLUGIN_LIST_FILE)
        } catch (error) {
            console.error("Error clearing cache:", error)
        }
    }
} 