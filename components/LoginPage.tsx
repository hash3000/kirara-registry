"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "./Layout"
import { useAuth } from "../lib/AuthContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert } from "./Alert"

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, title: "", message: "" })
  const { login } = useAuth()
  const router = useRouter()

  const showAlert = (title: string, message: string) => {
    setAlertInfo({ isOpen: true, title, message })
  }

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      if (response.ok) {
        login(apiKey)
        router.push("/admin")
      } else {
        const data = await response.json()
        showAlert("登录失败", data.message)
      }
    } catch (error) {
      showAlert("错误", "发生未知错误，请稍后重试。")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">管理员登录</h1>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="输入 API 密钥"
          disabled={isLoading}
        />
        <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
          {isLoading ? "登录中..." : "登录"}
        </Button>
      </div>
      <Alert
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
      />
    </Layout>
  )
}

