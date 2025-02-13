"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

import type { Plugin } from '@/lib/fileSystem'
import { InstallModal } from "./InstallModal"

interface PluginListProps {
  plugins: Plugin[]
  isAdmin?: boolean
  onRefreshCache?: (pluginName?: string) => void
}


export function PluginList({ plugins, isAdmin = false, onRefreshCache }: PluginListProps) {
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)

  const showInstallModal = (plugin: Plugin) => {
    setSelectedPlugin(plugin)
    setIsInstallModalOpen(true)
  }

  const closeInstallModal = () => {
    setIsInstallModalOpen(false)
    setSelectedPlugin(null)
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Button onClick={() => onRefreshCache?.()} className="mb-4">
          刷新所有缓存
        </Button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((plugin) => (
          <div key={plugin.name} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{plugin.name}</h2>
              <p className="text-gray-600">{plugin.description}</p>
              <p className="text-sm text-gray-500">作者: {plugin.author}</p>
              <p className="text-sm text-gray-500">PyPI 包名: {plugin.pypiPackage}</p>
              <p className="text-sm text-gray-500">最新版本: {plugin.pypiInfo?.version ?? 'Unknown'}</p>
            </div>
            <div className="flex justify-end mt-4">
              {plugin.pypiInfo?.homePage && (
                <Button variant="outline" onClick={() => window.open(plugin.pypiInfo?.homePage, '_blank')} className="mr-2">
                  项目主页
                </Button>
              )}
              <Button onClick={() => showInstallModal(plugin)} className="mr-2">安装</Button>
              {isAdmin && <Button onClick={() => onRefreshCache?.(plugin.name)}>刷新缓存</Button>}
            </div>
          </div>
        ))}
      </div>
      {/* 安装 Modal */}
      {isInstallModalOpen && selectedPlugin && (
        <InstallModal plugin={selectedPlugin} onClose={closeInstallModal} />
      )}
    </div>
  )
}

