import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiClient } from '@/lib/api'

export async function GET() {
  return NextResponse.json({ 
    message: 'Customer Portal Register API - Proxy to Laravel Client Backend',
    methods: ['POST'],
    backend: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    endpoint: '/customer-portal/register'
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Frontend API: Customer Portal Register called')
    
    const clientData = await request.json()
    console.log('📝 Register attempt for:', clientData.email)
    
    const { name, email, password, confirmPassword, phone, address, company_name, tax_code } = clientData

    // Validation cơ bản
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Tên, email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu xác nhận không khớp' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      )
    }

    console.log('🔄 Calling Laravel Client API...')

    // Gọi đến Laravel Client API
    const response = await apiClient.register({
      name,
      email,
      password,
      password_confirmation: confirmPassword,
      phone,
      address,
      company_name,
      tax_code,
    })

    console.log('✅ Laravel Client API response received')

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: response.message || 'Đăng ký thất bại' },
        { status: 400 }
      )
    }

    // Trả về dữ liệu từ Laravel (client object)
    return NextResponse.json({
      success: true,
      message: response.message || 'Đăng ký thành công',
      client: response.user, // Laravel trả về 'user', frontend expect 'client'
      token: response.token,
    })
    
  } catch (error) {
    console.error('❌ Frontend API register error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Lỗi kết nối đến server Laravel'
      },
      { status: 500 }
    )
  }
}