import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  try {
    const token = auth.replace('Bearer ', '')
    return jwt.verify(token, process.env.JWT_SECRET!) as any
  } catch { return null }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await prisma.order.findMany({
      orderBy: { placed_at: 'desc' },
      include: {
        user: {
          select: { full_name: true, email: true }
        },
        items: {
          include: {
            book: {
              select: { title: true }
            }
          }
        },
        address: true
      }
    })

    return NextResponse.json({ orders })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}