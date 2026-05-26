import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  try {
    return jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET!) as any
  } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        user_id: user.sub || user.userId,
      },
      include: {
        items: {
          include: {
            book: { select: { title: true, cover_image_url: true } }
          }
        },
        address: true,
      }
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}