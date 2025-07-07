import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { registerClient } from '@/lib/auth'

export async function GET() {
  return NextResponse.json({ 
    message: 'Client Register API endpoint',
    methods: ['POST'],
    info: 'Register new client account'
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Client Register API called')
    
    const clientData = await request.json()
    console.log('📝 Register data:', { ...clientData, password: '***' })
    
    const { name, email, password, phone, address, birth } = clientData

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Tên, email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    // Đăng ký client mới
    const client = await registerClient({
      name,
      email,
      password,
      phone,
      address,
      birth,
    })

    console.log('✅ Client registered:', client ? 'Yes' : 'No')

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công',
      client,
    })
    
  } catch (error) {
    console.error('❌ Client register error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi server'
      },
      { status: 500 }
    )
  }
}
