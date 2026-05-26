'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  quantity: number
  book: {
    id: string
    title: string
    price: number
    discount_price: number | null
    cover_image_url: string | null
    format: string | null
    authors: { author: { name: string } }[]
  }
}

interface Cart {
  id: string
  items: CartItem[]
  total: number
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    const res = await fetch('/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setCart(data)
    setLoading(false)
  }

  useEffect(() => { fetchCart() }, [])

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = localStorage.getItem('token')
    await fetch(`/api/cart/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    })
    fetchCart()
  }

  const removeItem = async (itemId: string) => {
    const token = localStorage.getItem('token')
    await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchCart()
  }

  const handleCheckout = () => {
    if (!cart || !cart.items.length) return

    // Sync DB cart → localStorage so checkout page can read items
    const localCart = cart.items.map(item => ({
      quantity: item.quantity,
      book: {
        id: item.book.id,
        title: item.book.title,
        price: item.book.price,
        discount_price: item.book.discount_price,
        cover_image_url: item.book.cover_image_url,
      }
    }))
    localStorage.setItem('folio_cart', JSON.stringify(localCart))
    router.push('/checkout')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading cart...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Page&amp;Spine
          </Link>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">← Continue Shopping</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          🛒 Your Shopping Cart ({cart?.items.length ?? 0} items)
        </h1>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <div className="text-gray-500 mb-4">Your cart is empty</div>
            <Link href="/" className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-700 transition">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                  <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.book.cover_image_url ? (
                      <img src={item.book.cover_image_url} alt={item.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center p-1">
                        {item.book.title}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{item.book.title}</div>
                    <div className="text-sm text-gray-500 mb-1">
                      {item.book.authors[0]?.author.name}
                    </div>
                    {item.book.format && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {item.book.format}
                      </span>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <select
                        value={item.quantity}
                        onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
                      >
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      ${((item.book.discount_price ?? item.book.price) * item.quantity).toFixed(2)}
                    </div>
                    {item.book.discount_price && (
                      <div className="text-xs text-gray-400 line-through">
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">
                      {cart.total >= 35 ? 'Free' : '$4.99'}
                    </span>
                  </div>
                  {cart.total < 35 && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                      Add ${(35 - cart.total).toFixed(2)} more for free shipping!
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${(cart.total + (cart.total >= 35 ? 0 : 4.99)).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition"
                >
                  Proceed to Checkout
                </button>
                <Link href="/" className="block text-center text-sm text-gray-500 mt-3 hover:text-gray-900">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}