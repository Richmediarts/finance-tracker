import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const transactionSchema = z.object({ amount: z.number(), date: z.string(), description: z.string().optional(), payee: z.string().optional(), accountId: z.string(), categoryId: z.string().optional(), cleared: z.boolean().default(true) })

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const transactions = await db.transaction.findMany({ where: { userId: session.user.id }, include: { category: true, account: true }, orderBy: { date: "desc" }, take: limit })
  return NextResponse.json({ transactions })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const data = transactionSchema.parse(body)
    const transaction = await db.transaction.create({ data: { ...data, date: new Date(data.date), userId: session.user.id }, include: { category: true, account: true } })
    const account = await db.account.findUnique({ where: { id: data.accountId } })
    const category = await db.category.findUnique({ where: { id: data.categoryId || undefined } })
    if (account) {
      const isIncome = category?.type === "INCOME"
      const newBalance = isIncome ? account.balance + data.amount : account.balance - data.amount
      await db.account.update({ where: { id: data.accountId }, data: { balance: newBalance } })
    }
    return NextResponse.json(transaction)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
