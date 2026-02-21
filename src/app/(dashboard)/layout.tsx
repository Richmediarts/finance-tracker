"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { 
  LayoutDashboard, Wallet, CreditCard, PiggyBank, TrendingDown, TrendingUp, 
  Settings, LogOut, Menu, X, Bell, Search, ChevronLeft, ChevronRight
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isLoading = status === "loading"

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
    <div className="min-h-screen bg-background">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full bg-[#11142D] text-white transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-72"
      } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <span className="text-lg font-bold">F</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold">Finance</h1>
                <p className="text-xs text-white/50">Admin Dashboard</p>
              </div>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-3 px-3 py-2.5 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-20 right-[-12px] w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-colors hidden lg:flex"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`absolute bottom-0 w-full p-4 border-t border-white/10 ${sidebarCollapsed ? "px-2" : ""}`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white font-medium shrink-0">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-white/50 truncate">{session?.user?.email}</p>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })} 
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 pl-10 pr-4 py-2 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-border mx-1"></div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white text-sm font-medium">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
