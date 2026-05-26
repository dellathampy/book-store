'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface FormData {
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  pinCode: string
  country: string
  paymentMethod: string
}

interface FormErrors {
  fullName?: string
  phone?: string
  street?: string
  city?: string
  state?: string
  pinCode?: string
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
]

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')

  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: 'Kerala',
    pinCode: '',
    country: 'India',
    paymentMethod: 'COD',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    const raw = localStorage.getItem('folio_cart')
    const cart: CartItem[] = raw ? JSON.parse(raw) : []
    if (!cart.length) { router.push('/cart'); return }

    setItems(cart)
    const subtotal = cart.reduce(
      (sum, i) => sum + (i.book.discount_price ?? i.book.price) * i.quantity, 0
    )
    setTotal(subtotal)
    setLoading(false)
  }, [])

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.street.trim()) e.street = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state) e.state = 'State is required'
    if (!/^\d{6}$/.test(form.pinCode)) e.pinCode = 'Enter a valid 6-digit PIN code'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handlePlaceOrder = async () => {
    if (!validate()) return

    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    setPlacing(true)
    setApiError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(i => ({
            bookId: i.book.id,
            quantity: i.quantity,
          })),
          address: {
            fullName: form.fullName,
            phone: form.phone,
            street: form.street,
            city: form.city,
            state: form.state,
            pinCode: form.pinCode,
            country: form.country,
          },
          paymentMethod: form.paymentMethod,
          total,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error || 'Failed to place order. Please try again.')
        setPlacing(false)
        return
      }

      // Clear cart
      localStorage.removeItem('folio_cart')
      router.push(`/orders/${data.orderId}?success=true`)

    } catch (err) {
      setApiError('Network error. Please check your connection and try again.')
      setPlacing(false)
    }
  }

  const shipping = total >= 35 ? 0 : 5.99
  const finalTotal = total + shipping

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-gray-900">Page&amp;Spine</Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/cart" className="hover:text-gray-900">Cart</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Error banner */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {apiError}
            </div>
          )}

          {/* Delivery address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="fullName" value={form.fullName} onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${errors.fullName ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="As on government ID"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  name="phone" value={form.phone} onChange={handleChange}
                  maxLength={10} inputMode="numeric"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input
                  name="pinCode" value={form.pinCode} onChange={handleChange}
                  maxLength={6} inputMode="numeric"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${errors.pinCode ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="6-digit PIN"
                />
                {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (House No, Street, Area)</label>
                <textarea
                  name="street" value={form.street}
                  onChange={handleChange as any}
                  rows={2}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 resize-none ${errors.street ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="House number, street, locality"
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Town</label>
                <input
                  name="city" value={form.city} onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="City"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  name="state" value={form.state} onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 ${errors.state ? 'border-red-400' : 'border-gray-300'}`}
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  value="India" readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                { value: 'UPI', label: 'UPI / Net Banking', icon: '📱', desc: 'Pay via UPI, NEFT, or IMPS' },
                { value: 'CARD', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${form.paymentMethod === opt.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                  <input
                    type="radio" name="paymentMethod" value={opt.value}
                    checked={form.paymentMethod === opt.value}
                    onChange={handleChange}
                    className="accent-gray-900"
                  />
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            {/* Free shipping nudge */}
            {shipping > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
                Add ${(35 - total).toFixed(2)} more for FREE shipping!
              </div>
            )}

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.book.cover_image_url ? (
                      <img src={item.book.cover_image_url} alt={item.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-1 text-center">{item.book.title}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 line-clamp-2">{item.book.title}</div>
                    <div className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</div>
                    <div className="text-xs font-semibold text-gray-900 mt-1">
                      ${((item.book.discount_price ?? item.book.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Placing Order...
                </>
              ) : (
                `Place Order · $${finalTotal.toFixed(2)}`
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              🔒 Secure checkout. Your data is safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}