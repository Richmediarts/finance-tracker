import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getMonthRange } from "@/lib/utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const { start, end } = getMonthRange()

  const accounts = await db.account.findMany({ where: { userId } })
  const transactions = await db.transaction.findMany({ where: { userId, date: { gte: start, lte: end } }, include: { category: true } })
  const budgets = await db.budget.findMany({ where: { userId }, include: { category: true } })
  const goals = await db.savingsGoal.findMany({ where: { userId } })
  const debts = await db.debt.findMany({ where: { userId } })
  const investments = await db.investment.findMany({ where: { userId } })

  const totalAssets = accounts.filter(a => !["LOAN", "MORTGAGE", "CREDIT_CARD"].includes(a.type)).reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = accounts.filter(a => ["LOAN", "MORTGAGE", "CREDIT_CARD"].includes(a.type)).reduce((sum, a) => sum + Math.abs(a.balance), 0)

  const incomeTransactions = transactions.filter(t => t.category?.type === "INCOME")
  const expenseTransactions = transactions.filter(t => t.category?.type === "EXPENSE")
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const spendingByCategory = expenseTransactions.reduce((acc, t) => {
    if (t.categoryId) {
      const cat = t.category!
      if (!acc[cat.id]) acc[cat.id] = { name: cat.name, color: cat.color || "#6b7280", amount: 0 }
      acc[cat.id].amount += t.amount
    }
    return acc
  }, {} as Record<string, { name: string; color: string; amount: number }>)

  const budgetProgress = budgets.map(budget => {
    const spent = expenseTransactions.filter(t => t.categoryId === budget.categoryId).reduce((sum, t) => sum + t.amount, 0)
    return { categoryName: budget.category.name, categoryColor: budget.category.color || "#6b7280", budgeted: budget.amount, spent, remaining: budget.amount - spent, percentUsed: (spent / budget.amount) * 100 }
  })

  const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.shares * inv.currentPrice, 0)
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0)

  const recentTransactions = await db.transaction.findMany({ where: { userId }, include: { category: true, account: true }, orderBy: { date: "desc" }, take: 10 })

  return NextResponse.json({
    summary: { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities, totalIncome, totalExpenses, savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0, totalDebt, totalInvestmentValue },
    spendingByCategory: Object.values(spendingByCategory),
    budgetProgress,
    goals: goals.map(g => ({ ...g, progress: (g.currentAmount / g.targetAmount) * 100 })),
    recentTransactions,
    accounts: accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance, institution: a.institution })),
  })
}
