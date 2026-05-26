import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  try {
    const token = auth.replace('Bearer ', '')
    return jwt.verify(token, process.env.JWT_SECRET!) as any
  } catch { return null }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true
      }
    })

    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json(profile)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromToken(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { full_name, phone, current_password, new_password } = body

    if (new_password) {
      const existingUser = await prisma.user.findUnique({ where: { id: user.userId } })
      if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const match = await bcrypt.compare(current_password, existingUser.password_hash)
      if (!match) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

      const password_hash = await bcrypt.hash(new_password, 12)
      await prisma.user.update({
        where: { id: user.userId },
        data: { password_hash }
      })

      return NextResponse.json({ message: 'Password updated' })
    }

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: { full_name, phone }
    })

    return NextResponse.json({ message: 'Profile updated', user: updated })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}