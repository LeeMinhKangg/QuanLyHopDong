import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { connectDB } from '@/lib/database'

// Function lấy hợp đồng theo email với type chính xác
async function getContractsByEmail(email: string) {
  const connection = await connectDB()
  try {
    const [rows] = await connection.execute(`
      SELECT 
        c.*,
        ct.name as contract_type_name,
        cs.name as contract_status_name,
        cs.code as contract_status_code,
        cl.name as client_name,
        cl.email as client_email
      FROM contracts c
      LEFT JOIN contract_types ct ON c.contract_type_id = ct.id
      LEFT JOIN contract_statuses cs ON c.contract_status_id = cs.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE cl.email = ?
      ORDER BY c.created_at DESC
    `, [email])
    
    await connection.end()
    
    // Cast rows thành array để TypeScript hiểu
    const contractsArray = rows as any[]
    console.log(`📄 Found ${contractsArray.length} contracts for email ${email}`)
    
    return contractsArray
  } catch (error) {
    await connection.end()
    console.error('❌ Error fetching contracts by email:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
        { status: 400 }
      )
    }

    console.log('📋 Getting contracts for email:', email)

    // Lấy danh sách hợp đồng theo email
    const contracts = await getContractsByEmail(email)

    return NextResponse.json({
      success: true,
      data: contracts,
      message: contracts.length > 0 ? `Tìm thấy ${contracts.length} hợp đồng` : 'Chưa có hợp đồng nào'
    })

  } catch (error) {
    console.error('❌ Contracts API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}

// Tạo thêm API test để kiểm tra dữ liệu
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
        { status: 400 }
      )
    }

    // Test query đơn giản
    const connection = await connectDB()
    
    try {
      // Kiểm tra client tồn tại
      const [clientRows] = await connection.execute(
        'SELECT id, name, email FROM clients WHERE email = ?',
        [email]
      )
      
      const clients = clientRows as any[]
      console.log('🔍 Client check:', clients.length > 0 ? 'Found' : 'Not found')
      
      if (clients.length === 0) {
        await connection.end()
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Không tìm thấy client với email này',
          debug: { email, clientFound: false }
        })
      }
      
      // Kiểm tra hợp đồng
      const [contractRows] = await connection.execute(
        'SELECT COUNT(*) as total FROM contracts WHERE client_id = ?',
        [clients[0].id]
      )
      
      const contractCount = (contractRows as any[])[0].total
      console.log('📄 Contract count:', contractCount)
      
      await connection.end()
      
      return NextResponse.json({
        success: true,
        data: [],
        message: `Client tìm thấy. Số hợp đồng: ${contractCount}`,
        debug: { 
          email, 
          clientFound: true, 
          clientId: clients[0].id,
          contractCount: contractCount 
        }
      })
      
    } catch (dbError) {
      await connection.end()
      throw dbError
    }
    
  } catch (error) {
    console.error('❌ Test API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}