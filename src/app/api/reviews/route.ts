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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { book_id, rating, comment } = await req.json()

    if (!book_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Book ID and rating (1-5) are required' }, { status: 400 })
    }

    const existing = await prisma.review.findFirst({
      where: { book_id, user_id: user.userId }
    })

    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment }
      })
      return NextResponse.json({ message: 'Review updated', review: updated })
    }

    const review = await prisma.review.create({
      data: { book_id, user_id: user.userId, rating, comment }
    })

    return NextResponse.json({ message: 'Review submitted', review }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}