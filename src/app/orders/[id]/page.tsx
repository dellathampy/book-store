'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  book: {
    title: string
    cover_image_url: string | null
  }
}

interface Order {
  id: string
  total_amount: number
  status: string
  payment_status: string
  payment_method: string | null
  placed_at: string
  items: OrderItem[]
  address: {
    full_name: string
    street: string
    city: string
    state: string | null
    postal_code: string
    country: string
  }
}

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setOrder(data.order)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load order'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/" className="text-sm text-gray-600 hover:underline">Go home</Link>
      </div>
    </div>
  )

  if (!order) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">Page&amp;Spine</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 text-sm">
            Thank you for your order. We'll send you a confirmation shortly.
          </p>
          <p className="text-xs text-gray-400 mt-2 font-mono">Order #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.book.cover_image_url ? (
                    <img src={item.book.cover_image_url} alt={item.book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center p-1">{item.book.title}</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.book.title}</div>
                  <div className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Delivering To</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="font-medium text-gray-900">{order.address.full_name}</div>
            <div>{order.address.street}</div>
            <div>{order.address.city}{order.address.state ? `, ${order.address.state}` : ''} — {order.address.postal_code}</div>
            <div>{order.address.country}</div>
          </div>
        </div>

        {/* Payment + status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Method</span>
            <span className="font-medium">{order.payment_method || 'Cash on Delivery'}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">Status</span>
            <span className={`font-medium capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 text-center bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition text-sm"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:border-gray-900 transition text-sm"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  )
}