import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const format = searchParams.get('format') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '99999')
    const sort = searchParams.get('sort') || 'createdAt'

    const where: any = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { isbn: { contains: search, mode: 'insensitive' } },
            { publisher: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        category ? { category: { slug: category } } : {},
        format ? { format } : {},
        { price: { gte: minPrice, lte: maxPrice } }
      ]
    }

    const orderBy: any = 
      sort === 'price_asc' ? { price: 'asc' } :
      sort === 'price_desc' ? { price: 'desc' } :
      sort === 'title' ? { title: 'asc' } :
      { created_at: 'desc' }

    const total = await prisma.book.count({ where })

    const books = await prisma.book.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        authors: {
          include: { author: true }
        },
        reviews: {
          select: { rating: true }
        }
      }
    })

    const booksWithRating = books.map(book => ({
      ...book,
      avgRating: book.reviews.length > 0
        ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length
        : 0,
      reviewCount: book.reviews.length
    }))

    return NextResponse.json({
      books: booksWithRating,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error: any) {
    console.error('Books fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, isbn, price, discount_price,
      stock_quantity, language, format,
      page_count, published_date, publisher,
      cover_image_url, category_id
    } = body

    if (!title || !price || !category_id) {
      return NextResponse.json(
        { error: 'Title, price and category are required' },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        title, isbn, price,
        discount_price, stock_quantity,
        language, format, page_count,
        published_date: published_date ? new Date(published_date) : null,
        publisher, cover_image_url, category_id
      },
      include: { category: true }
    })

    return NextResponse.json({
      message: 'Book created successfully',
      book
    }, { status: 201 })

  } catch (error: any) {
    console.error('Book create error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}