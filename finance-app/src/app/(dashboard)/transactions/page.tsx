"use client"
import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

interface Category { id: string; name: string; color?: string; type: string }
interface Account { id: string; name: string }
interface Transaction { id: string; amount: number; date: string; description?: string; category: Category | null; account: Account }

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const PERSIST_KEY = "finance.transactions.filters.v1"
  // Persisted filters state
  // Filters state
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [accountFilter, setAccountFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")

  // Build a new filtered fetch URL helper
  const buildQuery = () => {
    const q: string[] = []
    if (dateFrom) q.push(`dateFrom=${encodeURIComponent(dateFrom)}`)
    if (dateTo) q.push(`dateTo=${encodeURIComponent(dateTo)}`)
    if (searchTerm) q.push(`description=${encodeURIComponent(searchTerm)}`)
    if (accountFilter) q.push(`accountId=${encodeURIComponent(accountFilter)}`)
    if (categoryFilter) q.push(`categoryId=${encodeURIComponent(categoryFilter)}`)
    if (minAmount) q.push(`minAmount=${encodeURIComponent(minAmount)}`)
    if (maxAmount) q.push(`maxAmount=${encodeURIComponent(maxAmount)}`)
    if (q.length === 0) return ""
    return "?" + q.join("&")
  }

  const fetchWithFilters = () => {
    const url = `/api/transactions${buildQuery()}&limit=200` // ensure limit param exists; if empty, API uses 50 default
    fetch(url).then(r => r.json()).then(res => {
      setTransactions(res.transactions ?? [])
      // leave accounts/categories loaded from initial fetch
    })
  }
  const [formData, setFormData] = useState({ amount: "", date: new Date().toISOString().split("T")[0], description: "", accountId: "", categoryId: "" })

  useEffect(() => { Promise.all([fetch("/api/transactions").then(r => r.json()), fetch("/api/categories").then(r => r.json()), fetch("/api/accounts").then(r => r.json())]).then(([t, c, a]) => { setTransactions(t.transactions || []); setCategories(c.filter((x: Category) => x.type === "EXPENSE")); setAccounts(a); setLoading(false) }) }, [])

  // Load persisted filters on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY)
      if (saved) {
        const f = JSON.parse(saved)
        if (f.dateFrom) setDateFrom(f.dateFrom)
        if (f.dateTo) setDateTo(f.dateTo)
        if (f.accountFilter) setAccountFilter(f.accountFilter)
        if (f.categoryFilter) setCategoryFilter(f.categoryFilter)
        if (f.minAmount) setMinAmount(f.minAmount)
        if (f.maxAmount) setMaxAmount(f.maxAmount)
        if (f.searchTerm) setSearchTerm(f.searchTerm)
        // apply after setting, so we fetch with filters
        setTimeout(() => fetchWithFilters(), 0)
      }
    } catch {
      // ignore parsing errors
    }
  }, [])

  // Persist filters on change
  useEffect(() => {
    const toSave = { dateFrom, dateTo, accountFilter, categoryFilter, minAmount, maxAmount, searchTerm }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(toSave))
  }, [dateFrom, dateTo, accountFilter, categoryFilter, minAmount, maxAmount, searchTerm])

  const resetFilters = () => {
    setDateFrom(""); setDateTo(""); setAccountFilter(""); setCategoryFilter(""); setMinAmount(""); setMaxAmount(""); setSearchTerm("");
    localStorage.removeItem(PERSIST_KEY)
    fetchWithFilters()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }) })
    setShowForm(false); setFormData({ amount: "", date: new Date().toISOString().split("T")[0], description: "", accountId: "", categoryId: "" })
    fetch("/api/transactions").then(r => r.json()).then(t => setTransactions(t.transactions || []))
  }

  const filteredTransactions = transactions

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Transactions</h1><p className="text-gray-500">Track your income and expenses</p></div><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-5 h-5" />Add Transaction</button></div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">New Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Account</label><select value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required><option value="">Select account</option>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md"><option value="">Select category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            </div>
            <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Transaction</button><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Date From</span>
          <input type="date" className="border border-gray-300 rounded px-2 py-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="text-sm text-gray-700 ml-2">Date To</span>
          <input type="date" className="border border-gray-300 rounded px-2 py-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Account</span>
          <select className="border border-gray-300 rounded px-2 py-1" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
            <option value="">All accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <span className="text-sm text-gray-700 ml-2">Category</span>
          <select className="border border-gray-300 rounded px-2 py-1" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-sm text-gray-700 ml-2">Min</span>
          <input type="number" step="0.01" className="border border-gray-300 rounded px-2 py-1 w-24" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
          <span className="text-sm text-gray-700">Max</span>
          <input type="number" step="0.01" className="border border-gray-300 rounded px-2 py-1 w-24" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
        <button className="px-3 py-2 bg-blue-600 text-white rounded-md" onClick={fetchWithFilters}>Apply</button>
        <button className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400" onClick={resetFilters}>Reset Filters</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tx.date)}</td>
                <td className="px-6 py-4 font-medium">{tx.description || "Transaction"}</td>
                <td className="px-6 py-4"><span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category?.color || "#6b7280" }}></span>{tx.category?.name || "Uncategorized"}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500"><Link href={`/accounts?accountId=${tx.account.id}`}>{tx.account.name}</Link></td>
                <td className={`px-6 py-4 text-right font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && <div className="text-center py-12 text-gray-500">No transactions found</div>}
      </div>
    </div>
  )
}
