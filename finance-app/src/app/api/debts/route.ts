import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const debtSchema = z.object({ name: z.string().min(1), balance: z.number(), originalBalance: z.number(), interestRate: z.number(), minimumPayment: z.number(), dueDate: z.string().optional() })

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const debts = await db.debt.findMany({ where: { userId: session.user.id }, include: { payments: { orderBy: { date: "desc" } } }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(debts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const data = debtSchema.parse(body)
    const debt = await db.debt.create({ data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null, userId: session.user.id } })
    return NextResponse.json(debt)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
