"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  color?: string
  type: string
}

interface Budget {
  id: string
  amount: number
  period: string
  category: Category
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    period: "MONTHLY",
    categoryId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [budgetsRes, catsRes] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories"),
    ])
    const cats = await catsRes.json()
    setBudgets(await budgetsRes.json())
    setCategories(cats.filter((c: Category) => c.type === "EXPENSE"))
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        amount: parseFloat(formData.amount),
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setFormData({ amount: "", period: "MONTHLY", categoryId: "" })
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return
    await fetch(`/api/budgets/${id}`, { method: "DELETE" })
    fetchData()
  }

  const periodLabels: Record<string, string> = {
    WEEKLY: "Weekly",
    BIWEEKLY: "Bi-weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-500">Manage your spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Budget
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">New Budget</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create Budget
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Total Monthly Budget</h2>
          <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: budget.category.color || "#6b7280" }}
                ></span>
                <h3 className="font-semibold">{budget.category.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(budget.amount)}</p>
            <p className="text-sm text-gray-500">{periodLabels[budget.period]}</p>
          </div>
        ))}
      </div>

      {budgets.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <p>No budgets yet. Create your first budget to track spending.</p>
        </div>
      )}
    </div>
  )
}
