import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getContractByIdAndEmail } from '@/lib/contracts'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const contractId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
        { status: 400 }
      )
    }

    if (!contractId || isNaN(contractId)) {
      return NextResponse.json(
        { success: false, message: 'ID hợp đồng không hợp lệ' },
        { status: 400 }
      )
    }

    console.log(`📄 Getting contract ${contractId} for email:`, email)

    // Lấy chi tiết hợp đồng theo ID và email
    const contract = await getContractByIdAndEmail(contractId, email)

    if (!contract) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hợp đồng' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contract
    })

  } catch (error) {
    console.error('❌ Contract detail API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}