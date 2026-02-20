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
  notes: z.string().optional(),
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
  const accountId = searchParams.get("accountId")
  const categoryId = searchParams.get("categoryId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  const where: any = { userId: session.user.id }

  if (accountId) where.accountId = accountId
  if (categoryId) where.categoryId = categoryId
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = new Date(startDate)
    if (endDate) where.date.lte = new Date(endDate)
  }

  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    db.transaction.count({ where }),
  ])

  return NextResponse.json({ transactions, total })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = transactionSchema.parse(body)

    const account = await db.account.findUnique({
      where: { id: data.accountId },
    })

    if (!account || account.userId !== session.user.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const transaction = await db.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: session.user.id,
      },
      include: {
        category: true,
        account: true,
      },
    })

    const category = await db.category.findUnique({
      where: { id: data.categoryId || undefined },
    })

    const isIncome = category?.type === "INCOME"
    const newBalance = isIncome
      ? account.balance + data.amount
      : account.balance - data.amount

    await db.account.update({
      where: { id: data.accountId },
      data: { balance: newBalance },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Transaction error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
