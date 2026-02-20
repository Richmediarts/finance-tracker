import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const investmentSchema = z.object({
  name: z.string().min(1),
  symbol: z.string().optional(),
  type: z.enum(["STOCK", "ETF", "BOND", "MUTUAL_FUND", "CRYPTO", "OTHER"]),
  shares: z.number().positive(),
  purchasePrice: z.number(),
  currentPrice: z.number(),
  purchaseDate: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const investments = await db.investment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const enriched = investments.map((inv) => ({
    ...inv,
    totalValue: inv.shares * inv.currentPrice,
    totalCost: inv.shares * inv.purchasePrice,
    gain: (inv.currentPrice - inv.purchasePrice) * inv.shares,
    gainPercent: ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100,
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = investmentSchema.parse(body)

    const investment = await db.investment.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(investment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
