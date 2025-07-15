import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiClient } from '@/lib/api'

export async function GET() {
  return NextResponse.json({ 
    message: 'Customer Portal Login API - Proxy to Laravel Client Backend',
    methods: ['POST'],
    backend: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    endpoint: '/customer-portal/login'
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Frontend API: Customer Portal Login called')
    
    const body = await request.json()
    console.log('📧 Login attempt for:', body.email)
    
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    console.log('🔄 Calling Laravel Client API...')
    
    // Gọi đến Laravel Client API
    const response = await apiClient.login({ email, password })
    
    console.log('✅ Laravel Client API response received')

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: response.message || 'Đăng nhập thất bại' },
        { status: 401 }
      )
    }

    // Trả về dữ liệu từ Laravel (client object)
    return NextResponse.json({
      success: true,
      message: response.message || 'Đăng nhập thành công',
      client: response.user, // Laravel trả về 'user', frontend expect 'client'
      token: response.token,
    })
    
  } catch (error) {
    console.error('❌ Frontend API login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi kết nối đến server Laravel'
      },
      { status: 500 }
    )
  }
}