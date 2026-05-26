'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  price: number
  discount_price: number | null
  stock_quantity: number
  format: string | null
  category: { name: string }
  authors: { author: { name: string } }[]
}

interface Order {
  id: string
  total_amount: number
  status: string
  payment_status: string
  placed_at: string
  user: { full_name: string; email: string }
  items: { quantity: number; book: { title: string } }[]
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [books, setBooks] = useState<Book[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData(token)
  }, [])

  const fetchData = async (token: string) => {
    const [booksRes, ordersRes] = await Promise.all([
      fetch('/api/books?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } })
    ])
    const booksData = await booksRes.json()
    const ordersData = await ordersRes.json()

    setBooks(booksData.books || [])
    setOrders(ordersData.orders || [])
    setStats({
      totalBooks: booksData.total || 0,
      totalOrders: ordersData.orders?.length || 0,
      totalRevenue: ordersData.orders?.reduce((s: number, o: Order) => s + o.total_amount, 0) || 0,
      pendingOrders: ordersData.orders?.filter((o: Order) => o.status === 'placed').length || 0
    })
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('token')
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
    fetchData(token!)
  }

  const deleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    const token = localStorage.getItem('token')
    await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchData(token!)
  }

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      placed: 'bg-blue-50 text-blue-700',
      packed: 'bg-yellow-50 text-yellow-700',
      shipped: 'bg-purple-50 text-purple-700',
      delivered: 'bg-green-50 text-green-700',
      cancelled: 'bg-red-50 text-red-700',
      paid: 'bg-green-50 text-green-700',
      pending: 'bg-yellow-50 text-yellow-700',
      failed: 'bg-red-50 text-red-700',
    }
    return colors[status] || 'bg-gray-50 text-gray-700'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading admin panel...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-yellow-400">
            Page&Spine
          </Link>
          <span className="text-gray-400 text-sm">/ Admin Panel</span>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-gray-300 hover:text-white">
            View Store →
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Books', value: stats.totalBooks, icon: '📚' },
            { label: 'Total Orders', value: stats.totalOrders, icon: '📦' },
            { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'orders', label: '📦 Orders' },
            { id: 'books', label: '📚 Books' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{order.user.full_name}</div>
                      <div className="text-gray-500 text-xs">{new Date(order.placed_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${order.total_amount.toFixed(2)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Low Stock Books</h3>
              <div className="space-y-3">
                {books.filter(b => b.stock_quantity < 10).map(book => (
                  <div key={book.id} className="flex items-center justify-between text-sm">
                    <div className="font-medium text-gray-900">{book.title}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      book.stock_quantity === 0 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {book.stock_quantity === 0 ? 'Out of stock' : `${book.stock_quantity} left`}
                    </span>
                  </div>
                ))}
                {books.filter(b => b.stock_quantity < 10).length === 0 && (
                  <div className="text-gray-500 text-sm">All books are well stocked ✅</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">
                      #{order.id.slice(0, 8)}
                      <div className="text-gray-400">{new Date(order.placed_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{order.user.full_name}</div>
                      <div className="text-xs text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {order.items.map((item, i) => (
                        <div key={i}>{item.book.title} x{item.quantity}</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="placed">Placed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">All Books ({books.length})</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Book</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        <div className="text-xs text-gray-500">{book.authors[0]?.author.name}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{book.category.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">${book.discount_price ?? book.price}</div>
                        {book.discount_price && (
                          <div className="text-xs text-gray-400 line-through">${book.price}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          book.stock_quantity === 0 ? 'bg-red-50 text-red-700' :
                          book.stock_quantity < 10 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {book.stock_quantity} in stock
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <Link
                          href={`/books/${book.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => deleteBook(book.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}