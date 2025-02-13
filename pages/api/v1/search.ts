// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from "next"
import * as cache from "../../../lib/cache"

let isCacheInitialized = false

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 懒加载缓存
  if (!isCacheInitialized) {
    await cache.buildCache()
    isCacheInitialized = true
  }

  const { query = "", page = "1", pageSize = "10" } = req.query
  const pageNumber = Number.parseInt(page as string, 10)
  const itemsPerPage = Number.parseInt(pageSize as string, 10)

  const result = await cache.searchPlugins(query as string, pageNumber, itemsPerPage)
  res.status(200).json(result)
}