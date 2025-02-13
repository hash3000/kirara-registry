import type { NextApiRequest, NextApiResponse } from "next"
import { refreshCache, refreshAllCaches } from "../../../lib/cache"

const API_KEY = process.env.API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { authorization } = req.headers

  if (authorization !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { name } = req.query

  try {
    if (name) {
      if (typeof name !== "string") {
        return res.status(400).json({ error: "Invalid plugin name" })
      }
      await refreshCache(name)
      res.status(200).json({ message: `Cache refreshed for plugin: ${name}` })
    } else {
      await refreshAllCaches()
      res.status(200).json({ message: "All caches refreshed successfully" })
    }
  } catch (error) {
    console.error("Failed to refresh cache:", error)
    res.status(500).json({ error: "Failed to refresh cache" })
  }
}

