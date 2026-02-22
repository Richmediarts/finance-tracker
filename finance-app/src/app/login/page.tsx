"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) throw new Error(res.error)
      router.push("/")
      router.refresh()
    } catch (err: any) { setError(err.message || "Failed to sign in") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#11142D]">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-md dark:bg-[#1E2130]">
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">Sign In</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-black dark:text-white">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link></p>
      </div>
    </div>
  )
}
