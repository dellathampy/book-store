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

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, address, paymentMethod } = body

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Fetch real prices from DB
    const bookIds = items.map((i: any) => i.bookId || i.book?.id)
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, price: true, discount_price: true, stock_quantity: true, title: true }
    })

    // Check stock
    for (const item of items) {
      const bookId = item.bookId || item.book?.id
      const book = books.find(b => b.id === bookId)
      if (!book) {
        return NextResponse.json({ error: `Book not found: ${bookId}` }, { status: 400 })
      }
      if (book.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for: ${book.title}` }, { status: 400 })
      }
    }

    // Calculate real total
    const realTotal = items.reduce((sum: number, item: any) => {
      const bookId = item.bookId || item.book?.id
      const book = books.find(b => b.id === bookId)!
      const price = Number(book.discount_price ?? book.price)
      return sum + price * item.quantity
    }, 0)

    // Create address
    const addressRecord = await prisma.address.create({
      data: {
        user_id: user.sub || user.userId,
        full_name: address.fullName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode || address.pinCode,
        country: address.country || 'India',
        is_default: false,
      }
    })

    // Create order + items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: user.sub || user.userId,
          address_id: addressRecord.id,
          subtotal: realTotal,
          total_amount: realTotal,
          status: 'placed',
          payment_status: 'pending',
          payment_method: paymentMethod || 'COD',
          items: {
            create: items.map((item: any) => {
              const bookId = item.bookId || item.book?.id
              const book = books.find(b => b.id === bookId)!
              const unitPrice = Number(book.discount_price ?? book.price)
              return {
                book_id: bookId,
                quantity: item.quantity,
                unit_price: unitPrice,
              }
            })
          }
        },
        include: { items: true }
      })

      // Decrement stock
      for (const item of items) {
        const bookId = item.bookId || item.book?.id
        await tx.book.update({
          where: { id: bookId },
          data: { stock_quantity: { decrement: item.quantity } }
        })
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      total: realTotal
    }, { status: 201 })

  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { user_id: user.sub || user.userId },
      include: {
        items: {
          include: {
            book: { select: { title: true, cover_image_url: true } }
          }
        },
        address: true,
      },
      orderBy: { placed_at: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}