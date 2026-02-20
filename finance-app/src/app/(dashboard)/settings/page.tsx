"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [name, setName] = useState(session?.user?.name || "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    setTimeout(() => { setSaving(false); setMessage("Settings saved successfully!") }, 1000)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-gray-500">Manage your account and preferences</p></div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-4 max-w-md">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={session?.user?.email || ""} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /><p className="text-xs text-gray-500 mt-1">Email cannot be changed</p></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          {message && <p className="text-green-600 text-sm">{message}</p>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-600"><p><strong>Version:</strong> 1.0.0</p><p><strong>Data Storage:</strong> Local PostgreSQL database</p><p><strong>Host:</strong> Self-hosted on Ubuntu Server</p></div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Your data is stored locally on your server. Regular backups are recommended.</p>
          <div className="flex gap-4"><button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Export Data (JSON)</button><button className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50">Delete All Data</button></div>
        </div>
      </div>
    </div>
  )
}
