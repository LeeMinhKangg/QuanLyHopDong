import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateClient } from '@/lib/auth'

export async function GET() {
  return NextResponse.json({ 
    message: 'Client Login API endpoint',
    methods: ['POST'],
    info: 'Use existing client data from database'
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Client Login API called')
    
    const body = await request.json()
    console.log('📧 Request body:', { email: body.email, password: '***' })
    
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Xác thực client từ bảng clients
    const client = await authenticateClient(email, password)
    console.log('👤 Client found:', client ? 'Yes' : 'No')

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      client,
    })
    
  } catch (error) {
    console.error('❌ Client login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}