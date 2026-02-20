import { Account, AccountType, Category, CategoryType, Transaction, Budget, BudgetPeriod, SavingsGoal, Debt, DebtPayment, Investment, InvestmentType, Household, HouseholdMember, MemberRole } from "@prisma/client"

export type {
  Account,
  AccountType,
  Category,
  CategoryType,
  Transaction,
  Budget,
  BudgetPeriod,
  SavingsGoal,
  Debt,
  DebtPayment,
  Investment,
  InvestmentType,
  Household,
  HouseholdMember,
  MemberRole
}

export interface AccountWithTransactions extends Account {
  transactions: Transaction[]
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null
  account: Account
}

export interface BudgetWithCategory extends Budget {
  category: Category
}

export interface DebtWithPayments extends Debt {
  payments: DebtPayment[]
}

export interface InvestmentWithGain extends Investment {
  gain: number
  gainPercent: number
}

export interface DashboardSummary {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  totalIncome: number
  totalExpenses: number
  savingsRate: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  categoryColor: string
  budgeted: number
  spent: number
  remaining: number
}
