'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  isbn: string | null
  price: number
  discount_price: number | null
  stock_quantity: number
  language: string
  format: string | null
  page_count: number | null
  publisher: string | null
  cover_image_url: string | null
  category: { name: string; slug: string }
  authors: { role: string; author: { name: string } }[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    created_at: string
    user: { full_name: string }
  }[]
  avgRating: number
  reviewCount: number
}

export default function BookDetailPage() {
  const { bookId } = useParams()
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [adding, setAdding] = useState(false)

  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    const fetchBook = async () => {
      const res = await fetch(`/api/books/${bookId}`)
      if (!res.ok) { router.push('/'); return }
      const data = await res.json()
      setBook(data)
      setLoading(false)
    }
    if (bookId) fetchBook()
  }, [bookId])

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    setAdding(true)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ bookId: book!.id, quantity })
    })
    if (res.ok) {
      setMessage('Added to cart! 🎉')
    } else {
      setMessage('Something went wrong')
    }
    setTimeout(() => setMessage(''), 2000)
    setAdding(false)
  }

  const handleSubmitReview = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    setSubmittingReview(true)

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        book_id: book!.id,
        rating: reviewRating,
        comment: reviewComment
      })
    })

    const data = await res.json()
    setSubmittingReview(false)

    if (res.ok) {
      setReviewMessage('Review submitted! ✅')
      setReviewComment('')
      setReviewRating(5)
      // Refresh book to show new review
      const bookRes = await fetch(`/api/books/${bookId}`)
      const bookData = await bookRes.json()
      setBook(bookData)
      setTimeout(() => setReviewMessage(''), 3000)
    } else {
      setReviewMessage(data.error || 'Something went wrong')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading book...</div>
    </div>
  )

  if (!book) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Page&Spine
          </Link>
          <div className="flex-1" />
          <Link href="/cart" className="text-sm text-gray-600 hover:text-gray-900">🛒 Cart</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        {' > '}
        <span>{book.category.name}</span>
        {' > '}
        <span className="text-gray-900">{book.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center min-h-96">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="max-h-80 object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center p-4">
                  {book.title}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {['Front', 'Back', 'Spine', 'Edge'].map(view => (
                <button key={view} className="flex-1 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:border-gray-900 transition bg-white">
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">{book.title}</h1>
            <div className="text-gray-500 mb-3">
              By {book.authors.map((a, i) => (
                <span key={i} className="text-gray-900 font-medium">
                  {a.author.name}{i < book.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            {book.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500">{'★'.repeat(Math.round(book.avgRating))}</span>
                <span className="text-sm text-gray-600">{book.avgRating} / 5 ({book.reviewCount} reviews)</span>
              </div>
            )}

            {book.format && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Format</div>
                <div className="inline-flex border-2 border-gray-900 rounded-lg px-4 py-2 text-sm font-medium">
                  {book.format}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-red-600">${book.discount_price ?? book.price}</span>
              {book.discount_price && (
                <span className="text-gray-400 line-through text-lg">${book.price}</span>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
              🚚 Free shipping on orders over $35 · Delivery in 3-5 business days
            </div>

            <div className="mb-4">
              {book.stock_quantity > 0 ? (
                <span className="text-green-600 text-sm font-medium">✅ In Stock ({book.stock_quantity} available)</span>
              ) : (
                <span className="text-red-600 text-sm font-medium">❌ Out of Stock</span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-700">Quantity:</span>
              <select
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={adding || book.stock_quantity === 0}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-900 transition">❤️</button>
            </div>

            {message && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{message}</div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {book.isbn && <div><span className="text-gray-500">ISBN: </span><span>{book.isbn}</span></div>}
                {book.page_count && <div><span className="text-gray-500">Pages: </span><span>{book.page_count}</span></div>}
                {book.publisher && <div><span className="text-gray-500">Publisher: </span><span>{book.publisher}</span></div>}
                <div><span className="text-gray-500">Language: </span><span>{book.language}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Reader Reviews {book.reviewCount > 0 && `(${book.reviewCount})`}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Write a Review */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>

              {!isLoggedIn ? (
                <div className="text-sm text-gray-500">
                  <Link href="/login" className="text-gray-900 font-medium hover:underline">Sign in</Link> to leave a review.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`text-2xl transition ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Your Review (optional)</label>
                    <textarea
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                      placeholder="What did you think of this book?"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                    />
                  </div>

                  {reviewMessage && (
                    <div className={`text-sm px-3 py-2 rounded-lg ${
                      reviewMessage.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {reviewMessage}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>

            {/* Existing Reviews */}
            <div>
              {book.reviews.length === 0 ? (
                <div className="text-gray-500 text-sm bg-white rounded-xl border border-gray-200 p-6">
                  No reviews yet. Be the first to review this book!
                </div>
              ) : (
                <div className="space-y-4">
                  {book.reviews.map(review => (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900 text-sm">{review.user.full_name}</span>
                          <div className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}