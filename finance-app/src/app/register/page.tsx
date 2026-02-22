"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to register")
      router.push("/login?registered=true")
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#11142D]">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-md dark:bg-[#1E2130]">
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">Create Account</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-black dark:text-white">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required minLength={6} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link></p>
      </div>
    </div>
  )
}
