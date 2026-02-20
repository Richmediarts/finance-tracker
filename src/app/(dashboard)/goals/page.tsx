"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Trash2, Target } from "lucide-react"

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  icon?: string
  color?: string
  createdAt: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: "",
    icon: "🎯",
    color: "#22c55e",
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = () => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then(setGoals)
      .finally(() => setLoading(false))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        deadline: "",
        icon: "🎯",
        color: "#22c55e",
      })
      fetchGoals()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return
    await fetch(`/api/goals/${id}`, { method: "DELETE" })
    fetchGoals()
  }

  const icons = ["🎯", "🏠", "🚗", "✈️", "💍", "🎓", "💻", "👶", "🏖️", "💰"]
  const colors = ["#22c55e", "#3b82f6", "#f97316", "#ec4899", "#8b5cf6", "#eab308"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-500">Save for your dreams</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">New Savings Goal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 text-xl rounded-md ${formData.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-md ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create Goal
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Saved</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSaved)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Target</p>
            <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100
          return (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{goal.icon}</span>
                  <div>
                    <h3 className="font-semibold">{goal.name}</h3>
                    {goal.deadline && (
                      <p className="text-sm text-gray-500">Target: {formatDate(goal.deadline)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: goal.color || '#22c55e'
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{progress.toFixed(0)}% complete</span>
                <span className="font-semibold">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No savings goals yet. Set your first goal!</p>
        </div>
      )}
    </div>
  )
}
