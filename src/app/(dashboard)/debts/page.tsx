"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Trash2, TrendingDown } from "lucide-react"

interface Debt {
  id: string
  name: string
  balance: number
  originalBalance: number
  interestRate: number
  minimumPayment: number
  dueDate?: string
  payments: { id: string; amount: number; date: string }[]
  createdAt: string
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    originalBalance: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "",
  })
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchDebts()
  }, [])

  const fetchDebts = () => {
    fetch("/api/debts")
      .then((res) => res.json())
      .then(setDebts)
      .finally(() => setLoading(false))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        balance: parseFloat(formData.balance),
        originalBalance: parseFloat(formData.originalBalance),
        interestRate: parseFloat(formData.interestRate),
        minimumPayment: parseFloat(formData.minimumPayment),
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setFormData({
        name: "",
        balance: "",
        originalBalance: "",
        interestRate: "",
        minimumPayment: "",
        dueDate: "",
      })
      fetchDebts()
    }
  }

  const handlePayment = async (debtId: string) => {
    const res = await fetch(`/api/debts?id=${debtId}&action=payment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(paymentData.amount),
        date: paymentData.date,
      }),
    })

    if (res.ok) {
      setShowPaymentForm(null)
      setPaymentData({ amount: "", date: new Date().toISOString().split("T")[0] })
      fetchDebts()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this debt?")) return
    await fetch(`/api/debts?id=${id}`, { method: "DELETE" })
    fetchDebts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0)
  const totalOriginal = debts.reduce((sum, d) => sum + d.originalBalance, 0)
  const totalPaid = totalOriginal - totalDebt

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debt Tracker</h1>
          <p className="text-gray-500">Track and pay down your debts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Debt
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">New Debt</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debt Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Chase Credit Card"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalBalance}
                  onChange={(e) => setFormData({ ...formData, originalBalance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Payment</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Debt
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Debt</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Paid Off</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Original Total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalOriginal)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {debts.map((debt) => {
          const progress = ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100
          
          return (
            <div key={debt.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{debt.name}</h3>
                  <p className="text-sm text-gray-500">
                    {debt.interestRate}% APR • Min payment: {formatCurrency(debt.minimumPayment)}
                    {debt.dueDate && ` • Due: ${formatDate(debt.dueDate)}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(debt.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(debt.balance)}</p>
                  <p className="text-sm text-gray-500">{progress.toFixed(1)}% paid off</p>
                </div>
                <button
                  onClick={() => setShowPaymentForm(debt.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Record Payment
                </button>
              </div>

              {showPaymentForm === debt.id && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Record Payment</h4>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="date"
                      value={paymentData.date}
                      onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => handlePayment(debt.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setShowPaymentForm(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {debts.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No debts tracked yet. Add your first debt to start paying it off.</p>
        </div>
      )}
    </div>
  )
}
