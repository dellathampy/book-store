import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.bookId },
      include: {
        category: true,
        authors: {
          include: { author: true }
        },
        reviews: {
          include: {
            user: {
              select: { id: true, full_name: true }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const avgRating = book.reviews.length > 0
      ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length
      : 0

    return NextResponse.json({
      ...book,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: book.reviews.length
    })

  } catch (error: any) {
    console.error('Book fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    await prisma.bookAuthor.deleteMany({ where: { book_id: params.bookId } })
    await prisma.cartItem.deleteMany({ where: { book_id: params.bookId } })
    await prisma.wishlist.deleteMany({ where: { book_id: params.bookId } })
    await prisma.review.deleteMany({ where: { book_id: params.bookId } })
    await prisma.book.delete({ where: { id: params.bookId } })

    return NextResponse.json({ message: 'Book deleted' })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}