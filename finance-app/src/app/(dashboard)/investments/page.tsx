"use client"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"

interface Investment { id: string; name: string; symbol?: string; type: string; shares: number; purchasePrice: number; currentPrice: number; totalValue: number; totalCost: number; gain: number; gainPercent: number }

const typeLabels: Record<string, string> = { STOCK: "Stock", ETF: "ETF", BOND: "Bond", MUTUAL_FUND: "Mutual Fund", CRYPTO: "Cryptocurrency", OTHER: "Other" }

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", symbol: "", type: "STOCK", shares: "", purchasePrice: "", currentPrice: "" })

  useEffect(() => { fetch("/api/investments").then(r => r.json()).then(setInvestments).finally(() => setLoading(false)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/investments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, shares: parseFloat(formData.shares), purchasePrice: parseFloat(formData.purchasePrice), currentPrice: parseFloat(formData.currentPrice) }) })
    setShowForm(false); setFormData({ name: "", symbol: "", type: "STOCK", shares: "", purchasePrice: "", currentPrice: "" })
    fetch("/api/investments").then(r => r.json()).then(setInvestments)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0)
  const totalCost = investments.reduce((sum, inv) => sum + inv.totalCost, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Investments</h1><p className="text-gray-500">Track your investment portfolio</p></div><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-5 h-5" />Add Investment</button></div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">New Investment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Apple Inc" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label><input type="text" value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., AAPL" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md"><option value="STOCK">Stock</option><option value="ETF">ETF</option><option value="BOND">Bond</option><option value="MUTUAL_FUND">Mutual Fund</option><option value="CRYPTO">Cryptocurrency</option><option value="OTHER">Other</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shares</label><input type="number" step="0.0001" value={formData.shares} onChange={(e) => setFormData({ ...formData, shares: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label><input type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label><input type="number" step="0.01" value={formData.currentPrice} onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
            </div>
            <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Investment</button><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Total Value</p><p className="text-2xl font-bold">{formatCurrency(totalValue)}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Total Cost</p><p className="text-2xl font-bold">{formatCurrency(totalCost)}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Total Gain/Loss</p><p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalGain)}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Return</p><p className={`text-2xl font-bold flex items-center gap-2 ${totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalGainPercent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}{totalGainPercent.toFixed(2)}%</p></div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investment</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gain/Loss</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {investments.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><p className="font-medium">{inv.name}</p>{inv.symbol && <p className="text-sm text-gray-500">{inv.symbol}</p>}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{typeLabels[inv.type]}</td>
                <td className="px-6 py-4 text-right">{inv.shares.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.totalValue)}</td>
                <td className={`px-6 py-4 text-right font-medium ${inv.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(inv.gain)} ({inv.gainPercent.toFixed(2)}%)</td>
              </tr>
            ))}
          </tbody>
        </table>
        {investments.length === 0 && <div className="text-center py-12 text-gray-500">No investments tracked yet</div>}
      </div>
    </div>
  )
}
