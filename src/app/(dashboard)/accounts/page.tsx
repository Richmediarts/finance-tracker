"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Plus, Building, Wallet, CreditCard, TrendingUp, DollarSign, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Account {
  id: string
  name: string
  type: string
  institution?: string
  balance: number
  currency: string
  createdAt: string
}

const accountTypeIcons: Record<string, any> = {
  CHECKING: Wallet,
  SAVINGS: Building,
  CREDIT_CARD: CreditCard,
  CASH: DollarSign,
  INVESTMENT: TrendingUp,
}

const accountTypeColors: Record<string, string> = {
  CHECKING: "bg-blue-500",
  SAVINGS: "bg-green-500",
  CREDIT_CARD: "bg-red-500",
  CASH: "bg-gray-500",
  INVESTMENT: "bg-purple-500",
  LOAN: "bg-orange-500",
  MORTGAGE: "bg-orange-500",
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "CHECKING",
    institution: "",
    balance: 0,
  })
  const router = useRouter()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = () => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then(setAccounts)
      .finally(() => setLoading(false))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setShowForm(false)
      setFormData({ name: "", type: "CHECKING", institution: "", balance: 0 })
      fetchAccounts()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return
    await fetch(`/api/accounts/${id}`, { method: "DELETE" })
    fetchAccounts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500">Manage your financial accounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">New Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="INVESTMENT">Investment</option>
                  <option value="LOAN">Loan</option>
                  <option value="MORTGAGE">Mortgage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Chase Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create Account
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Total Balance</h2>
          <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const Icon = accountTypeIcons[account.type] || Wallet
          const color = accountTypeColors[account.type] || "bg-gray-500"
          
          return (
            <div key={account.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-semibold text-lg">{account.name}</h3>
              <p className="text-sm text-gray-500">{account.institution || account.type}</p>
              <p className={`text-xl font-bold mt-4 ${account.balance < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(account.balance)}
              </p>
            </div>
          )
        })}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No accounts yet. Add your first account to get started.</p>
        </div>
      )}
    </div>
  )
}
