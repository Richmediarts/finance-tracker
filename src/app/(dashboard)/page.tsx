"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank } from "lucide-react"

interface DashboardData {
  summary: {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    totalIncome: number
    totalExpenses: number
    savingsRate: number
    totalDebt: number
    totalInvestmentValue: number
  }
  spendingByCategory: { name: string; color: string; amount: number }[]
  budgetProgress: {
    categoryName: string
    categoryColor: string
    budgeted: number
    spent: number
    remaining: number
    percentUsed: number
  }[]
  goals: {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    progress: number
    icon?: string
    color?: string
  }[]
  recentTransactions: {
    id: string
    amount: number
    date: string
    description?: string
    category: { name: string; color?: string; icon?: string } | null
    account: { name: string }
  }[]
  accounts: {
    id: string
    name: string
    type: string
    balance: number
    institution?: string
  }[]
}

const statCards = [
  { key: 'netWorth', label: 'Net Worth', icon: Wallet, color: 'from-blue-500 to-blue-600' },
  { key: 'totalIncome', label: 'Total Income', icon: ArrowUpRight, color: 'from-green-500 to-green-600' },
  { key: 'totalExpenses', label: 'Total Expenses', icon: ArrowDownRight, color: 'from-red-500 to-red-600' },
  { key: 'savingsRate', label: 'Savings Rate', icon: TrendingUp, color: 'from-purple-500 to-purple-600', isPercent: true },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Failed to load dashboard</div>
  }

  const { summary, spendingByCategory, budgetProgress, goals, recentTransactions, accounts } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const value = stat.isPercent ? summary[stat.key as keyof typeof summary] : Number(summary[stat.key as keyof typeof summary])
          const isPositive = stat.key === 'savingsRate' ? value >= 0 : value >= 0
          const displayValue = stat.isPercent ? `${value.toFixed(1)}%` : formatCurrency(value)
          
          return (
            <div key={stat.key} className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.key === 'totalIncome' ? 'text-green-400' : stat.key === 'totalExpenses' ? 'text-red-400' : 'text-foreground'}`}>
                {displayValue}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          {spendingByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1E2130', border: '1px solid #2A2D3E', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No spending data yet
            </div>
          )}
        </div>

        {/* Budget Progress */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Budget Progress</h2>
          <div className="space-y-4">
            {budgetProgress.length > 0 ? (
              budgetProgress.slice(0, 5).map((budget) => (
                <div key={budget.categoryName}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">{budget.categoryName}</span>
                    <span className={budget.percentUsed > 100 ? 'text-red-400' : 'text-muted-foreground'}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${budget.percentUsed > 100 ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-8">No budgets set</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Accounts</h2>
          <div className="space-y-3">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.institution || account.type}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${account.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-8">No accounts yet</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${tx.category?.color || '#6C5DD3'}20` }}
                    >
                      <CreditCard className="w-5 h-5" style={{ color: tx.category?.color || '#6C5DD3' }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.description || tx.category?.name || 'Transaction'}</p>
                      <p className="text-sm text-muted-foreground">{tx.account.name} • {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-8">No transactions yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      {goals.length > 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Savings Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-medium text-foreground">{goal.name}</p>
                  <span className="text-2xl">{goal.icon || '🎯'}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-400"
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
