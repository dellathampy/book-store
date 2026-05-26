'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) { router.push('/login'); return }

      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) { router.push('/login'); return }

      const data = await res.json()
      setUser(data)
      setForm(f => ({ ...f, full_name: data.full_name, phone: data.phone || '' }))
      setLoading(false)
    }
    fetchProfile()
  }, [])
  const handleSaveProfile = async () => {

    if (!form.phone || form.phone.length !== 10) {
      setMessage('Invalid phone number ❌')
      setTimeout(() => setMessage(''), 3000)
      return
    }
  
    setSaving(true)
  
    const token = localStorage.getItem('token')
  
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: form.full_name,
        phone: form.phone
      })
    })
  
    setSaving(false)
  
    if (res.ok) {
      setMessage('Profile updated successfully! ✅')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('Something went wrong')
    }
  }
  const handleChangePassword = async () => {
    if (form.new_password !== form.confirm_password) {
      setMessage('Passwords do not match!')
      return
    }
    setSaving(true)
    const token = localStorage.getItem('token')
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        current_password: form.current_password,
        new_password: form.new_password
      })
    })
    setSaving(false)
    if (res.ok) {
      setMessage('Password changed successfully! ✅')
      setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }))
      setTimeout(() => setMessage(''), 3000)
    } else {
      const data = await res.json()
      setMessage(data.error || 'Something went wrong')
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading profile...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Page&Spine
          </Link>
          <div className="flex-1" />
          <Link href="/orders" className="text-sm text-gray-600 hover:text-gray-900">My Orders</Link>
          <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-800">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{user?.full_name}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-xs text-gray-400">
              Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { id: 'profile', label: '👤 Profile' },
            { id: 'password', label: '🔒 Password' },
            { id: 'orders', label: '📦 Orders' },
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

        {message && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  value={user?.email}
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.current_password}
                  onChange={e => setForm({ ...form, current_password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.new_password}
                  onChange={e => setForm({ ...form, new_password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <Link
              href="/orders"
              className="block text-center bg-gray-900 text-white py-3 rounded-lg text-sm hover:bg-gray-700 transition"
            >
              View All Orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}