'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Book {
  id: string
  title: string
  price: number
  discount_price: number | null
  cover_image_url: string | null
  format: string | null
  avgRating: number
  reviewCount: number
  authors: { author: { name: string } }[]
  category: { name: string }
}

interface CartItem {
  quantity: number
  book: {
    id: string
    title: string
    price: number
    discount_price: number | null
    cover_image_url: string | null
  }
}

export default function HomePage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [mounted, setMounted] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [addedId, setAddedId] = useState<string | null>(null)

  // Read auth + cart state on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('userName') || ''
  
    setIsLoggedIn(!!token)
    setUserName(name)
    refreshCartCount()
  
    setMounted(true)
  }, [])

  const refreshCartCount = () => {
    const raw = localStorage.getItem('folio_cart')
    const cart: CartItem[] = raw ? JSON.parse(raw) : []
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    setCartCount(count)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('folio_cart')
    setIsLoggedIn(false)
    setUserName('')
    setCartCount(0)
  }

  const handleAddToCart = (e: React.MouseEvent, book: Book) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const raw = localStorage.getItem('folio_cart')
    const cart: CartItem[] = raw ? JSON.parse(raw) : []

    const existing = cart.find(item => item.book.id === book.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        quantity: 1,
        book: {
          id: book.id,
          title: book.title,
          price: book.price,
          discount_price: book.discount_price,
          cover_image_url: book.cover_image_url,
        }
      })
    }

    localStorage.setItem('folio_cart', JSON.stringify(cart))
    refreshCartCount()

    // Flash feedback on the button
    setAddedId(book.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const fetchBooks = useCallback(async (query = '') => {
    setLoading(true)
    const res = await fetch(`/api/books${query ? `?search=${encodeURIComponent(query)}` : ''}`)
    const data = await res.json()
    setBooks(data.books || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks(search)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top banner */}
      <div className="bg-gray-900 text-yellow-400 text-center py-2 text-sm">
        Free standard shipping on orders over $35!
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-gray-900 whitespace-nowrap">
            Page&amp;Spine
          </Link>

          <form onSubmit={handleSearch} className="flex-1 flex border border-gray-900 rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search by Title, Author, or ISBN..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="bg-gray-900 text-yellow-400 px-4 text-sm">Search</button>
          </form>

          <div className="flex items-center gap-4 text-sm text-gray-600">
          {mounted && isLoggedIn ? (
              <>
              <Link href="/profile" className="hover:text-gray-900">
                👤 Profile
              </Link>
            
              <button
                onClick={handleLogout}
                className="hover:text-gray-900"
              >
                Sign out
              </button>
            </>
            ) : (
              <>
                <Link href="/profile" className="hover:text-gray-900">👤 Profile</Link>
                <Link href="/login" className="hover:text-gray-900">Sign in</Link>
                <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">Admin</Link>
                <Link href="/register" className="hover:text-gray-900">Register</Link>
              </>
            )}

            {/* Cart icon */}
            <Link href="/cart" className="relative flex items-center gap-1 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category nav */}
        <div className="bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
  { label: 'Fiction', slug: 'fiction' },
  { label: 'Non-Fiction', slug: 'non-fiction' },
  { label: 'Science Fiction', slug: 'sci-fi' },
  { label: 'Fantasy', slug: 'fantasy' },
  { label: 'Self Help', slug: 'self-help' },
].map(cat => (
  <Link
    key={cat.slug}
    href={`/search?category=${cat.slug}`}
    className="text-gray-300 hover:text-yellow-400 text-sm px-3 py-2 whitespace-nowrap"
  >
    {cat.label}
  </Link>
))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-4 leading-tight">
              Your next great read is waiting.
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              Explore handpicked collections voted by our community as this season's must-reads.
            </p>
            <button
              onClick={() => document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Shop the collection
            </button>
          </div>
          <div className="flex justify-center gap-4">
            {books.slice(0, 3).map((book, i) => (
              <div key={book.id} className={i === 1 ? 'mt-8' : ''}>
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-24 h-32 object-cover rounded-lg shadow-lg" />
                ) : (
                  <div className="w-24 h-32 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center text-xs text-center p-2">{book.title}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4">
          {[
            { icon: '📦', title: 'Pristine Condition', sub: 'No bent corners, guaranteed' },
            { icon: '🚚', title: 'Fast Shipping', sub: 'On all orders' },
            { icon: '🔄', title: 'Easy 30-Day Returns', sub: 'Physical returns' },
            { icon: '🔒', title: 'Secure Checkout', sub: 'SSL encrypted' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-r border-gray-200 last:border-r-0">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book grid */}
      <div id="books" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {search ? `Results for "${search}"` : 'Current Bestsellers'}
          </h2>
          {search && (
            <button onClick={() => { setSearch(''); fetchBooks() }} className="text-sm text-red-600 hover:underline">
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
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
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📚</div>
            <div className="text-gray-500">No books found</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map(book => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-gray-400 text-sm text-center p-4">{book.title}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{book.title}</div>
                    <div className="text-xs text-gray-500 mb-2">{book.authors[0]?.author.name}</div>
                    {book.format && (
                      <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mb-2">{book.format}</span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-600 font-semibold">
                        ${(book.discount_price ?? book.price).toFixed(2)}
                      </span>
                      {book.discount_price && (
                        <span className="text-gray-400 text-xs line-through">${book.price.toFixed(2)}</span>
                      )}
                    </div>
                    <button
                      onClick={e => handleAddToCart(e, book)}
                      className={`w-full text-xs py-2 rounded-lg transition font-medium ${
                        addedId === book.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-900 text-white hover:bg-gray-700'
                      }`}
                    >
                      {addedId === book.id ? '✓ Added!' : 'Add to cart'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs">
          © 2026 Page&amp;Spine. All rights reserved.
        </div>
      </footer>
    </div>
  )
}