'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

interface Book {
  id: string
  title: string
  price: number
  discount_price: number | null
  cover_image_url: string | null
  format: string | null
  stock_quantity: number
  avgRating: number
  reviewCount: number
  authors: { author: { name: string } }[]
  category: { name: string }
}

interface Category {
  id: string
  name: string
  slug: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    format: searchParams.get('format') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'createdAt'
  })

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  const fetchBooks = async (f = filters) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (f.search) params.set('search', f.search)
    if (f.category) params.set('category', f.category)
    if (f.format) params.set('format', f.format)
    if (f.minPrice) params.set('minPrice', f.minPrice)
    if (f.maxPrice) params.set('maxPrice', f.maxPrice)
    if (f.sort) params.set('sort', f.sort)
    params.set('limit', '20')

    const res = await fetch(`/api/books?${params}`)
    const data = await res.json()
    setBooks(data.books || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    fetchBooks(newFilters)
  }

  const clearFilters = () => {
    const reset = {
      search: '',
      category: '',
      format: '',
      minPrice: '',
      maxPrice: '',
      sort: 'createdAt'
    }
    setFilters(reset)
    fetchBooks(reset)
  }

  const activeFilterCount = [
    filters.category,
    filters.format,
    filters.minPrice,
    filters.maxPrice
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-gray-900 whitespace-nowrap">
            Page&Spine
          </Link>
          <form
            onSubmit={e => { e.preventDefault(); fetchBooks() }}
            className="flex-1 flex border border-gray-900 rounded-lg overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search by Title, Author, or ISBN..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-white"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
            <button type="submit" className="bg-gray-900 text-yellow-400 px-4 text-sm">
              Search
            </button>
          </form>
          <Link href="/cart" className="text-sm text-gray-600 hover:text-gray-900">🛒 Cart</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">

          {/* Sidebar Filters */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                    />
                    All Categories
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat.slug}
                        onChange={() => handleFilterChange('category', cat.slug)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Format</h3>
                <div className="space-y-1">
                  {['', 'Hardcover', 'Paperback'].map(fmt => (
                    <label key={fmt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        checked={filters.format === fmt}
                        onChange={() => handleFilterChange('format', fmt)}
                      />
                      {fmt || 'All Formats'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="space-y-1">
                  {[
                    { label: 'All Prices', min: '', max: '' },
                    { label: 'Under $15', min: '0', max: '15' },
                    { label: '$15 to $25', min: '15', max: '25' },
                    { label: '$25 to $40', min: '25', max: '40' },
                    { label: 'Over $40', min: '40', max: '9999' },
                  ].map(range => (
                    <label key={range.label} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                        onChange={() => {
                          const newFilters = { ...filters, minPrice: range.min, maxPrice: range.max }
                          setFilters(newFilters)
                          fetchBooks(newFilters)
                        }}
                      />
                      {range.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
                <select
                  value={filters.sort}
                  onChange={e => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="title">Title: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                {loading ? 'Searching...' : `${total} books found${filters.search ? ` for "${filters.search}"` : ''}`}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-4">📚</div>
                <div className="text-gray-500 mb-2">No books found</div>
                <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books.map(book => (
                  <Link key={book.id} href={`/books/${book.id}`}>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer h-full">
                      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-gray-400 text-sm text-center p-4">{book.title}</div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{book.title}</div>
                        <div className="text-xs text-gray-500 mb-2">{book.authors[0]?.author.name}</div>
                        <div className="flex items-center gap-1 mb-2">
                          {book.format && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{book.format}</span>
                          )}
                          {book.stock_quantity === 0 && (
                            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">Out of stock</span>
                          )}
                        </div>
                        {book.reviewCount > 0 && (
                          <div className="text-xs text-yellow-600 mb-1">
                            {'★'.repeat(Math.round(book.avgRating))} ({book.reviewCount})
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-semibold text-sm">
                            ${book.discount_price ?? book.price}
                          </span>
                          {book.discount_price && (
                            <span className="text-gray-400 text-xs line-through">${book.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <SearchContent />
    </Suspense>
  )
}