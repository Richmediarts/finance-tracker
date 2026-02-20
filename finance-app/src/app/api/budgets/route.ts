import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const budgetSchema = z.object({ amount: z.number().positive(), period: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).default("MONTHLY"), categoryId: z.string() })

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const budgets = await db.budget.findMany({ where: { userId: session.user.id }, include: { category: true }, orderBy: { category: { name: "asc" } } })
  return NextResponse.json(budgets)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const data = budgetSchema.parse(body)
    const existingBudget = await db.budget.findFirst({ where: { categoryId: data.categoryId, userId: session.user.id } })
    if (existingBudget) {
      const budget = await db.budget.update({ where: { id: existingBudget.id }, data: { amount: data.amount, period: data.period }, include: { category: true } })
      return NextResponse.json(budget)
    }
    const budget = await db.budget.create({ data: { ...data, userId: session.user.id }, include: { category: true } })
    return NextResponse.json(budget)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
