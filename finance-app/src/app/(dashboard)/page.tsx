"use client"
import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DashboardData {
  summary: { totalAssets: number; totalLiabilities: number; netWorth: number; totalIncome: number; totalExpenses: number; savingsRate: number; totalDebt: number; totalInvestmentValue: number }
  spendingByCategory: { name: string; color: string; amount: number }[]
  budgetProgress: { categoryName: string; categoryColor: string; budgeted: number; spent: number; percentUsed: number }[]
  goals: { id: string; name: string; targetAmount: number; currentAmount: number; progress: number; icon?: string }[]
  recentTransactions: { id: string; amount: number; date: string; description?: string; category: { name: string; color?: string } | null; account: { name: string } }[]
  accounts: { id: string; name: string; type: string; balance: number; institution?: string }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/dashboard").then(res => res.json()).then(setData).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  if (!data) return <div>Failed to load dashboard</div>

  const { summary, spendingByCategory, budgetProgress, goals, recentTransactions, accounts } = data

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500">Your financial overview</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Net Worth</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.netWorth)}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Total Income (Month)</p><p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Total Expenses (Month)</p><p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Savings Rate</p><p className={`text-2xl font-bold ${summary.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.savingsRate.toFixed(1)}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          {spendingByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={spendingByCategory} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
              {spendingByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie><Tooltip formatter={(value: number) => formatCurrency(value)} /></PieChart></ResponsiveContainer>
          ) : <div className="h-64 flex items-center justify-center text-gray-500">No spending data yet</div>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Budget Progress</h2>
          <div className="space-y-4">
            {budgetProgress.length > 0 ? budgetProgress.slice(0, 5).map(budget => (
              <div key={budget.categoryName}>
                <div className="flex justify-between text-sm mb-1"><span>{budget.categoryName}</span><span className={budget.percentUsed > 100 ? 'text-red-600' : 'text-gray-600'}>{formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${budget.percentUsed > 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}></div></div>
              </div>
            )) : <div className="text-gray-500 text-center py-8">No budgets set</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Accounts</h2>
          <div className="space-y-3">
            {accounts.length > 0 ? accounts.map(account => (
              <div key={account.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div><p className="font-medium">{account.name}</p><p className="text-sm text-gray-500">{account.institution || account.type}</p></div>
                <p className={`font-semibold ${account.balance >= 0 ? '' : 'text-red-600'}`}>{formatCurrency(account.balance)}</p>
              </div>
            )) : <div className="text-gray-500 text-center py-8">No accounts yet</div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category?.color || '#6b7280' }}></div>
                  <div><p className="font-medium">{tx.description || tx.category?.name || 'Transaction'}</p><p className="text-sm text-gray-500">{tx.account.name} • {formatDate(tx.date)}</p></div>
                </div>
                <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(tx.amount)}</p>
              </div>
            )) : <div className="text-gray-500 text-center py-8">No transactions yet</div>}
          </div>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Savings Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.slice(0, 3).map(goal => (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2"><p className="font-medium">{goal.name}</p><span className="text-2xl">{goal.icon || '🎯'}</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2"><div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.min(goal.progress, 100)}%` }}></div></div>
                <p className="text-sm text-gray-500">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
