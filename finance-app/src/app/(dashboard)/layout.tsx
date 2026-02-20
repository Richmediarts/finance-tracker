import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LayoutDashboard, Wallet, CreditCard, PiggyBank, TrendingDown, TrendingUp, Settings, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

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
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <item.icon className="w-5 h-5" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 w-full transition-colors">
            <LogOut className="w-5 h-5" />Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
