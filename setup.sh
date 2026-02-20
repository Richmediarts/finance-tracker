#!/bin/bash

# Finance Tracker Setup Script
# Run this on your Ubuntu server: bash -c "$(curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/setup.sh)"
# Or copy and paste the commands below

set -e

echo "=========================================="
echo "Finance Tracker - Self-Hosted Budget App"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
APP_DIR="/home/rich/finance-app"
DB_NAME="financeapp"
DB_USER="financeuser"
DB_PASS="financepassword123"

echo -e "${YELLOW}Step 1: Installing prerequisites...${NC}"

# Install Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

echo -e "${GREEN}Prerequisites installed!${NC}"

echo -e "${YELLOW}Step 2: Setting up PostgreSQL...${NC}"

# Create database and user
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

echo -e "${GREEN}Database configured!${NC}"

echo -e "${YELLOW}Step 3: Creating Next.js project...${NC}"

# Create project directory
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "finance-tracker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "@hookform/resolvers": "^3.3.4",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.344.0",
    "next": "14.1.0",
    "next-auth": "^4.24.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.0",
    "recharts": "^2.12.2",
    "tailwind-merge": "^2.2.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.35",
    "prisma": "^5.10.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
EOF

# Install dependencies
npm install

echo -e "${GREEN}Dependencies installed!${NC}"

echo -e "${YELLOW}Step 4: Creating project files...${NC}"

# Create directory structure
mkdir -p src/app/api/auth/register
mkdir -p src/app/api/accounts
mkdir -p src/app/api/transactions
mkdir -p src/app/api/budgets
mkdir -p src/app/api/goals
mkdir -p src/app/api/debts
mkdir -p src/app/api/investments
mkdir -p src/app/api/categories
mkdir -p src/app/api/dashboard
mkdir -p src/app/\(dashboard\)
mkdir -p src/app/login
mkdir -p src/app/register
mkdir -p src/app/accounts
mkdir -p src/app/transactions
mkdir -p src/app/budgets
mkdir -p src/app/goals
mkdir -p src/app/debts
mkdir -p src/app/investments
mkdir -p src/app/settings
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p prisma

# Create Prisma schema
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  transactions Transaction[]
  budgets      Budget[]
  goals        SavingsGoal[]
  debts        Debt[]
  investments  Investment[]
  householdMemberships HouseholdMember[]
}

model Household {
  id          String   @id @default(cuid())
  name        String
  createdAt   DateTime @default(now())
  members     HouseholdMember[]
  accounts    Account[]
  budgets     Budget[]
}

model HouseholdMember {
  id          String    @id @default(cuid())
  userId      String
  householdId String
  role        MemberRole @default(MEMBER)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  
  @@unique([userId, householdId])
}

enum MemberRole {
  OWNER
  MEMBER
}

model Account {
  id           String    @id @default(cuid())
  name         String
  type         AccountType
  institution  String?
  balance      Float     @default(0)
  currency     String    @default("USD")
  isShared     Boolean   @default(false)
  householdId  String?
  userId       String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  household    Household? @relation(fields: [householdId], references: [id])
  transactions Transaction[]
}

enum AccountType {
  CHECKING
  SAVINGS
  CREDIT_CARD
  CASH
  INVESTMENT
  LOAN
  MORTGAGE
}

model Category {
  id          String    @id @default(cuid())
  name        String
  icon        String?
  color       String?
  type        CategoryType
  userId      String
  isDefault   Boolean   @default(false)
  
  transactions Transaction[]
  budgets      Budget[]
  
  @@unique([name, userId])
}

enum CategoryType {
  INCOME
  EXPENSE
}

model Transaction {
  id          String    @id @default(cuid())
  amount      Float
  date        DateTime
  description String?
  payee       String?
  notes       String?
  isPending   Boolean   @default(false)
  cleared     Boolean   @default(true)
  
  accountId   String
  categoryId  String?
  userId      String
  
  account     Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category    Category? @relation(fields: [categoryId], references: [id])
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Budget {
  id          String    @id @default(cuid())
  amount      Float
  period      BudgetPeriod @default(MONTHLY)
  
  categoryId  String
  userId      String?
  householdId String?
  
  category    Category  @relation(fields: [categoryId], references: [id])
  user        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  household   Household? @relation(fields: [householdId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum BudgetPeriod {
  WEEKLY
  BIWEEKLY
  MONTHLY
  YEARLY
}

model SavingsGoal {
  id            String    @id @default(cuid())
  name          String
  targetAmount  Float
  currentAmount Float     @default(0)
  deadline      DateTime?
  icon          String?
  color         String?
  
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Debt {
  id              String    @id @default(cuid())
  name            String
  balance         Float
  originalBalance Float
  interestRate    Float
  minimumPayment  Float
  dueDate         DateTime?
  
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  payments        DebtPayment[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model DebtPayment {
  id        String   @id @default(cuid())
  amount    Float
  date      DateTime
  
  debtId    String
  debt      Debt     @relation(fields: [debtId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}

model Investment {
  id            String    @id @default(cuid())
  name          String
  symbol        String?
  type          InvestmentType
  shares        Float
  purchasePrice Float
  currentPrice Float
  purchaseDate  DateTime?
  
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum InvestmentType {
  STOCK
  ETF
  BOND
  MUTUAL_FUND
  CRYPTO
  OTHER
}
EOF

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://10.0.0.225"
EOF

# Run Prisma migration
npx prisma migrate dev --name init

echo -e "${GREEN}Database migrated!${NC}"

echo -e "${YELLOW}Step 5: Creating application files...${NC}"

# Create src/lib/db.ts
cat > src/lib/db.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
EOF

# Create src/lib/auth.ts
cat > src/lib/auth.ts << 'EOF'
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
}
EOF

# Create src/lib/utils.ts
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

export function getMonthRange(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}
EOF

# Create types
cat > src/types/next-auth.d.ts << 'EOF'
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
EOF

# Create components/AuthProvider.tsx
cat > src/components/AuthProvider.tsx << 'EOF'
"use client"

import { SessionProvider } from "next-auth/react"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
EOF

# Create app layout
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal finance management app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
EOF

# Create globals.css
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 249, 250, 251;
  --background-end-rgb: 255, 255, 255;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

a {
  color: inherit;
  text-decoration: none;
}
EOF

# Create auth API routes
cat > 'src/app/api/auth/[...nextauth]/route.ts' << 'EOF'
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
EOF

cat > src/app/api/auth/register/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = registerSchema.parse(body)

    const existingUser = await db.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: { email, passwordHash, name },
    })

    const defaultCategories = [
      { name: "Income", icon: "💰", color: "#22c55e", type: "INCOME" as const, isDefault: true },
      { name: "Food & Dining", icon: "🍔", color: "#f97316", type: "EXPENSE" as const, isDefault: true },
      { name: "Transportation", icon: "🚗", color: "#3b82f6", type: "EXPENSE" as const, isDefault: true },
      { name: "Housing", icon: "🏠", color: "#8b5cf6", type: "EXPENSE" as const, isDefault: true },
      { name: "Utilities", icon: "💡", color: "#eab308", type: "EXPENSE" as const, isDefault: true },
      { name: "Entertainment", icon: "🎬", color: "#ec4899", type: "EXPENSE" as const, isDefault: true },
      { name: "Shopping", icon: "🛍️", color: "#06b6d4", type: "EXPENSE" as const, isDefault: true },
      { name: "Healthcare", icon: "🏥", color: "#ef4444", type: "EXPENSE" as const, isDefault: true },
      { name: "Personal", icon: "👤", color: "#84cc16", type: "EXPENSE" as const, isDefault: true },
      { name: "Other", icon: "📦", color: "#6b7280", type: "EXPENSE" as const, isDefault: true },
    ]

    await db.category.createMany({
      data: defaultCategories.map((cat) => ({ ...cat, userId: user.id })),
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
EOF

# Create login page
cat > src/app/login/page.tsx << 'EOF'
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        throw new Error(res.error)
      }

      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
EOF

# Create register page
cat > src/app/register/page.tsx << 'EOF'
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

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to register")
      }

      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
EOF

# Create dashboard layout
cat > 'src/app/(dashboard)/layout.tsx' << 'EOF'
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  LayoutDashboard, Wallet, CreditCard, PiggyBank,
  TrendingDown, TrendingUp, Settings, LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/accounts", icon: Wallet, label: "Accounts" },
    { href: "/transactions", icon: CreditCard, label: "Transactions" },
    { href: "/budgets", icon: PiggyBank, label: "Budgets" },
    { href: "/goals", icon: TrendingUp, label: "Goals" },
    { href: "/debts", icon: TrendingDown, label: "Debts" },
    { href: "/investments", icon: TrendingUp, label: "Investments" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Finance Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">{session.user?.name || session.user?.email}</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
EOF

# Create all remaining API routes (we'll create them as a combined file)
# For brevity, let's create a simpler version

echo -e "${GREEN}Creating API routes...${NC}"

# Accounts API
cat > src/app/api/accounts/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const accountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT_CARD", "CASH", "INVESTMENT", "LOAN", "MORTGAGE"]),
  institution: z.string().optional(),
  balance: z.number().default(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await db.account.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(accounts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = accountSchema.parse(body)

    const account = await db.account.create({
      data: { ...data, userId: session.user.id },
    })

    return NextResponse.json(account)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
EOF

# Transactions API
cat > src/app/api/transactions/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const transactionSchema = z.object({
  amount: z.number(),
  date: z.string(),
  description: z.string().optional(),
  payee: z.string().optional(),
  accountId: z.string(),
  categoryId: z.string().optional(),
  cleared: z.boolean().default(true),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") || "50")

  const transactions = await db.transaction.findMany({
    where: { userId: session.user.id },
    include: { category: true, account: true },
    orderBy: { date: "desc" },
    take: limit,
  })

  return NextResponse.json({ transactions })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = transactionSchema.parse(body)

    const transaction = await db.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: session.user.id,
      },
      include: { category: true, account: true },
    })

    const account = await db.account.findUnique({ where: { id: data.accountId } })
    const category = await db.category.findUnique({ where: { id: data.categoryId || undefined } })
    
    if (account) {
      const isIncome = category?.type === "INCOME"
      const newBalance = isIncome ? account.balance + data.amount : account.balance - data.amount
      await db.account.update({ where: { id: data.accountId }, data: { balance: newBalance } })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
EOF

# Budgets API
cat > src/app/api/budgets/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const budgetSchema = z.object({
  amount: z.number().positive(),
  period: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).default("MONTHLY"),
  categoryId: z.string(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const budgets = await db.budget.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  })

  return NextResponse.json(budgets)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = budgetSchema.parse(body)

    const existingBudget = await db.budget.findFirst({
      where: { categoryId: data.categoryId, userId: session.user.id },
    })

    if (existingBudget) {
      const budget = await db.budget.update({
        where: { id: existingBudget.id },
        data: { amount: data.amount, period: data.period },
        include: { category: true },
      })
      return NextResponse.json(budget)
    }

    const budget = await db.budget.create({
      data: { ...data, userId: session.user.id },
      include: { category: true },
    })

    return NextResponse.json(budget)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
EOF

# Goals API
cat > src/app/api/goals/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const goalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().default(0),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const goals = await db.savingsGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(goals)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = goalSchema.parse(body)

    const goal = await db.savingsGoal.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
EOF

# Debts API
cat > src/app/api/debts/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const debtSchema = z.object({
  name: z.string().min(1),
  balance: z.number(),
  originalBalance: z.number(),
  interestRate: z.number(),
  minimumPayment: z.number(),
  dueDate: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const debts = await db.debt.findMany({
    where: { userId: session.user.id },
    include: { payments: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(debts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = debtSchema.parse(body)

    const debt = await db.debt.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(debt)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
EOF

# Investments API
cat > src/app/api/investments/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const investmentSchema = z.object({
  name: z.string().min(1),
  symbol: z.string().optional(),
  type: z.enum(["STOCK", "ETF", "BOND", "MUTUAL_FUND", "CRYPTO", "OTHER"]),
  shares: z.number().positive(),
  purchasePrice: z.number(),
  currentPrice: z.number(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const investments = await db.investment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const enriched = investments.map((inv) => ({
    ...inv,
    totalValue: inv.shares * inv.currentPrice,
    totalCost: inv.shares * inv.purchasePrice,
    gain: (inv.currentPrice - inv.purchasePrice) * inv.shares,
    gainPercent: ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100,
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = investmentSchema.parse(body)

    const investment = await db.investment.create({
      data: { ...data, userId: session.user.id },
    })

    return NextResponse.json(investment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
EOF

# Categories API
cat > src/app/api/categories/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const categories = await db.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  })

  return NextResponse.json(categories)
}
EOF

# Dashboard API
cat > src/app/api/dashboard/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getMonthRange } from "@/lib/utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { start, end } = getMonthRange()

  const accounts = await db.account.findMany({ where: { userId } })

  const transactions = await db.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { category: true },
  })

  const budgets = await db.budget.findMany({
    where: { userId },
    include: { category: true },
  })

  const goals = await db.savingsGoal.findMany({ where: { userId } })
  const debts = await db.debt.findMany({ where: { userId } })
  const investments = await db.investment.findMany({ where: { userId } })

  const totalAssets = accounts
    .filter((a) => !["LOAN", "MORTGAGE", "CREDIT_CARD"].includes(a.type))
    .reduce((sum, a) => sum + a.balance, 0)

  const totalLiabilities = accounts
    .filter((a) => ["LOAN", "MORTGAGE", "CREDIT_CARD"].includes(a.type))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0)

  const incomeTransactions = transactions.filter((t) => t.category?.type === "INCOME")
  const expenseTransactions = transactions.filter((t) => t.category?.type === "EXPENSE")

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const spendingByCategory = expenseTransactions.reduce((acc, t) => {
    if (t.categoryId) {
      const cat = t.category!
      if (!acc[cat.id]) {
        acc[cat.id] = { name: cat.name, color: cat.color || "#6b7280", amount: 0 }
      }
      acc[cat.id].amount += t.amount
    }
    return acc
  }, {} as Record<string, { name: string; color: string; amount: number }>)

  const budgetProgress = budgets.map((budget) => {
    const spent = expenseTransactions
      .filter((t) => t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      categoryName: budget.category.name,
      categoryColor: budget.category.color || "#6b7280",
      budgeted: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentUsed: (spent / budget.amount) * 100,
    }
  })

  const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.shares * inv.currentPrice, 0)
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0)

  const recentTransactions = await db.transaction.findMany({
    where: { userId },
    include: { category: true, account: true },
    orderBy: { date: "desc" },
    take: 10,
  })

  return NextResponse.json({
    summary: {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      totalIncome,
      totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      totalDebt,
      totalInvestmentValue,
    },
    spendingByCategory: Object.values(spendingByCategory),
    budgetProgress,
    goals: goals.map((g) => ({ ...g, progress: (g.currentAmount / g.targetAmount) * 100 })),
    recentTransactions,
    accounts: accounts.map((a) => ({ id: a.id, name: a.name, type: a.type, balance: a.balance, institution: a.institution })),
  })
}
EOF

echo -e "${GREEN}API routes created!${NC}"

# Create config files
echo -e "${YELLOW}Step 6: Creating config files...${NC}"

# Create tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
module.exports = nextConfig
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules
.next
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts
EOF

echo -e "${GREEN}Config files created!${NC}"

echo -e "${YELLOW}Step 7: Building application...${NC}"

npm run build

echo -e "${GREEN}Build complete!${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}Finance Tracker Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "To start the app:"
echo "  cd $APP_DIR"
echo "  npm start"
echo ""
echo "Then open: http://10.0.0.225:3000"
echo ""
echo "First time setup:"
echo "  1. Go to /register to create an account"
echo "  2. Add your accounts"
echo "  3. Start tracking transactions!"
echo ""
