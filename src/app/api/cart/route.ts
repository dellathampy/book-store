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

    let cart = await prisma.cart.findUnique({
      where: { user_id: user.userId },
      include: {
        items: {
          include: {
            book: {
              include: {
                authors: { include: { author: true } }
              }
            }
          }
        }
      }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: user.userId },
        include: {
          items: {
            include: {
              book: {
                include: {
                  authors: { include: { author: true } }
                }
              }
            }
          }
        }
      })
    }

    const total = cart.items.reduce((sum, item) => {
      const price = item.book.discount_price ?? item.book.price
      return sum + price * item.quantity
    }, 0)

    return NextResponse.json({ ...cart, total })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bookId, quantity = 1 } = await req.json()
    if (!bookId) return NextResponse.json({ error: 'Book ID required' }, { status: 400 })

    let cart = await prisma.cart.findUnique({ where: { user_id: user.userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { user_id: user.userId } })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cart_id: cart.id, book_id: bookId }
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    } else {
      await prisma.cartItem.create({
        data: { cart_id: cart.id, book_id: bookId, quantity }
      })
    }

    return NextResponse.json({ message: 'Added to cart' })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}