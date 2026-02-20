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
  currency: z.string().default("USD"),
  isShared: z.boolean().default(false),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await db.account.findMany({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
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
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
