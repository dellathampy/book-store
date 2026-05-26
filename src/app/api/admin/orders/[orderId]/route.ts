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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = getUserFromToken(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status } = await req.json()

    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: { status }
    })

    await prisma.orderTracking.create({
      data: {
        order_id: params.orderId,
        status,
        description: `Order status updated to ${status}`
      }
    })

    return NextResponse.json({ message: 'Order updated', order })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}