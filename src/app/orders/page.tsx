'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
    city: string
    state: string | null
  }
}

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(() => { setError('Failed to load orders'); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-gray-900">Page&amp;Spine</Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Back to Shop</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Orders</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">📦</div>
            <div className="text-gray-600 font-medium mb-2">No orders yet</div>
            <div className="text-gray-400 text-sm mb-6">Looks like you haven't placed any orders.</div>
            <Link href="/" className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Order ID</div>
                      <div className="text-sm font-mono font-medium text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Placed on</div>
                      <div className="text-sm text-gray-700">
                        {new Date(order.placed_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs text-gray-600 border border-gray-300 px-3 py-1 rounded-lg hover:border-gray-900 hover:text-gray-900 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Order items */}
                <div className="px-6 py-4 space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.book.cover_image_url ? (
                          <img src={item.book.cover_image_url} alt={item.book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-1 text-center">
                            {item.book.title}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.book.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Qty: {item.quantity} · ${item.unit_price.toFixed(2)} each
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery info */}
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    📍 Delivering to {order.address.full_name} · {order.address.city}{order.address.state ? `, ${order.address.state}` : ''}
                  </span>
                  <span className="capitalize">
                    💳 {order.payment_method || 'COD'} · {order.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}