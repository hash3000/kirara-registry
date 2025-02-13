import { Plugin } from "../types"

export interface CacheBackend {
  /**
   * 获取缓存的插件信息
   */
  get(name: string): Promise<Plugin | null>

  /**
   * 设置缓存的插件信息
   */
  set(name: string, plugin: Plugin): Promise<void>

  /**
   * 获取所有缓存的插件
   */
  getAll(): Promise<Plugin[]>

  /**
   * 清除所有缓存
   */
  clear(): Promise<void>
} 