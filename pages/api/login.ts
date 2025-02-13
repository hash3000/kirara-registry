import type { NextApiRequest, NextApiResponse } from "next"
import { setTimeout } from "timers/promises"

const API_KEY = process.env.API_KEY
const MAX_ATTEMPTS = 3
const LOCK_TIME = 10 * 60 * 1000 // 10 minutes in milliseconds

interface LoginAttempt {
  count: number
  lastAttempt: number
}

const loginAttempts = new Map<string, LoginAttempt>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { apiKey } = req.body
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress

  if (typeof ip !== "string") {
    return res.status(400).json({ message: "无效的 IP 地址" })
  }

  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 }

  // Check if the IP is locked
  if (attempt.count >= MAX_ATTEMPTS && Date.now() - attempt.lastAttempt < LOCK_TIME) {
    const remainingTime = Math.ceil((LOCK_TIME - (Date.now() - attempt.lastAttempt)) / 60000)
    return res.status(429).json({ message: `登录尝试次数过多，请在 ${remainingTime} 分钟后重试。` })
  }

  // Reset attempt count if lock time has passed
  if (Date.now() - attempt.lastAttempt >= LOCK_TIME) {
    attempt.count = 0
  }

  // Delay response by 5-10 seconds
  await setTimeout(Math.floor(Math.random() * 5000) + 5000)

  if (apiKey === API_KEY) {
    loginAttempts.delete(ip) // Reset attempts on successful login
    return res.status(200).json({ message: "登录成功" })
  } else {
    attempt.count += 1
    attempt.lastAttempt = Date.now()
    loginAttempts.set(ip, attempt)

    if (attempt.count >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "登录尝试次数过多，请在 10 分钟后重试。" })
    } else {
      return res.status(401).json({ message: "无效的 API 密钥" })
    }
  }
}

