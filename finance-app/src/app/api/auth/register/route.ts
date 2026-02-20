import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1).optional() })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = registerSchema.parse(body)
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await db.user.create({ data: { email, passwordHash, name } })
    const defaultCategories = [
      { name: "Income", icon: "💰", color: "#22c55e", type: "INCOME", isDefault: true },
      { name: "Food & Dining", icon: "🍔", color: "#f97316", type: "EXPENSE", isDefault: true },
      { name: "Transportation", icon: "🚗", color: "#3b82f6", type: "EXPENSE", isDefault: true },
      { name: "Housing", icon: "🏠", color: "#8b5cf6", type: "EXPENSE", isDefault: true },
      { name: "Utilities", icon: "💡", color: "#eab308", type: "EXPENSE", isDefault: true },
      { name: "Entertainment", icon: "🎬", color: "#ec4899", type: "EXPENSE", isDefault: true },
      { name: "Shopping", icon: "🛍️", color: "#06b6d4", type: "EXPENSE", isDefault: true },
      { name: "Healthcare", icon: "🏥", color: "#ef4444", type: "EXPENSE", isDefault: true },
      { name: "Personal", icon: "👤", color: "#84cc16", type: "EXPENSE", isDefault: true },
      { name: "Other", icon: "📦", color: "#6b7280", type: "EXPENSE", isDefault: true },
    ]
    await db.category.createMany({ data: defaultCategories.map(c => ({ ...c, userId: user.id })) })
    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
