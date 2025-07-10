// frontend/src/app/api/contracts/[id]/route.tsx - Debug version
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { connectDB } from '@/lib/database'

interface RouteParams {
  params: {
    id: string
  }
}

// Function debug để kiểm tra dữ liệu
async function debugContractData(contractId: number, email: string) {
  const connection = await connectDB()
  try {
    // Kiểm tra contract có tồn tại không
    const [contractCheck] = await connection.execute(`
      SELECT id, contract_number, client_id 
      FROM contracts 
      WHERE id = ?
    `, [contractId])
    
    console.log('🔍 Contract check:', contractCheck)
    
    // Kiểm tra client có tồn tại không
    const [clientCheck] = await connection.execute(`
      SELECT id, name, email 
      FROM clients 
      WHERE email = ?
    `, [email])
    
    console.log('🔍 Client check:', clientCheck)
    
    // Kiểm tra mapping contract-client
    const [mappingCheck] = await connection.execute(`
      SELECT c.id, c.contract_number, c.client_id, cl.email
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = ?
    `, [contractId])
    
    console.log('🔍 Contract-Client mapping:', mappingCheck)
    
    await connection.end()
    return {
      contractExists: (contractCheck as any[]).length > 0,
      clientExists: (clientCheck as any[]).length > 0,
      contract: (contractCheck as any[])[0],
      client: (clientCheck as any[])[0],
      mapping: (mappingCheck as any[])[0]
    }
  } catch (error) {
    await connection.end()
    throw error
  }
}

// Function lấy chi tiết hợp đồng - cải tiến
async function getContractDetailByIdAndEmail(contractId: number, email: string) {
  const connection = await connectDB()
  try {
    // Query chính - cải tiến để handle trường hợp client_id null
    const [contractRows] = await connection.execute(`
      SELECT 
        c.*,
        ct.name as contract_type_name,
        cs.name as contract_status_name,
        cs.code as contract_status_code,
        cl.name as client_name,
        cl.email as client_email,
        cl.phone as client_phone,
        cl.address as client_address,
        cl.company_name as client_company,
        cl.tax_code as client_tax_code,
        d.name as department_name,
        u.name as sales_employee_name,
        u.email as sales_employee_email
      FROM contracts c
      LEFT JOIN contract_types ct ON c.contract_type_id = ct.id
      LEFT JOIN contract_statuses cs ON c.contract_status_id = cs.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.sales_employee_id = u.id
      WHERE c.id = ? 
      AND (
        cl.email = ? OR 
        c.client_id IS NULL OR
        c.client_id = (SELECT id FROM clients WHERE email = ? LIMIT 1)
      )
      LIMIT 1
    `, [contractId, email, email])
    
    const contract = (contractRows as any[])[0]
    if (!contract) {
      await connection.end()
      return null
    }

    // Nếu contract không có client_id, gán thông tin client hiện tại
    if (!contract.client_id) {
      const [currentClient] = await connection.execute(`
        SELECT id, name, email, phone, address, company_name, tax_code
        FROM clients WHERE email = ? LIMIT 1
      `, [email])
      
      const clientInfo = (currentClient as any[])[0]
      if (clientInfo) {
        contract.client_name = clientInfo.name
        contract.client_email = clientInfo.email
        contract.client_phone = clientInfo.phone
        contract.client_address = clientInfo.address
        contract.client_company = clientInfo.company_name
        contract.client_tax_code = clientInfo.tax_code
      }
    }

    // Lấy thông tin contract participants
    const [participantRows] = await connection.execute(`
      SELECT 
        party_type,
        name,
        position,
        address,
        phone,
        email,
        tax_code,
        bank_account,
        bank_name
      FROM contract_participants
      WHERE contract_id = ?
      ORDER BY party_type
    `, [contractId])

    // Lấy thông tin contract items/products - sử dụng bảng có sẵn
    const [itemRows] = await connection.execute(`
      SELECT 
        cp.*,
        p.name as product_name,
        p.unit as product_unit
      FROM contract_products cp
      LEFT JOIN products p ON cp.product_id = p.id
      WHERE cp.contract_id = ?
      ORDER BY cp.id
    `, [contractId])

    // Lấy thông tin attachments
    const [attachmentRows] = await connection.execute(`
      SELECT 
        id,
        file_name,
        file_path,
        uploaded_by,
        created_at
      FROM contract_attachments
      WHERE contract_id = ?
      ORDER BY created_at DESC
    `, [contractId])

    // Tạo mock payments nếu chưa có bảng
    const mockPayments = []
    if (contract.pay) {
      mockPayments.push({
        id: 1,
        amount: contract.total_value,
        payment_date: contract.sign_date || contract.start_date,
        payment_method: contract.pay_method || 'Chuyển khoản',
        payment_status: 'completed',
        reference_number: `PAY-${contract.contract_number}`,
        created_at: contract.updated_at
      })
    }

    // Lấy thông tin contract notes
    const [noteRows] = await connection.execute(`
      SELECT 
        cn.*,
        u.name as created_by_name
      FROM contract_notes cn
      LEFT JOIN users u ON cn.created_by = u.id
      WHERE cn.contract_id = ?
      ORDER BY cn.created_at DESC
    `, [contractId])

    // Tạo mock activities
    const mockActivities = [
      {
        activity_type: 'contract_created',
        activity_name: 'Tạo hợp đồng',
        activity_description: `Hợp đồng ${contract.contract_number} được tạo`,
        activity_date: contract.created_at,
        actor_name: contract.sales_employee_name || 'System'
      },
      {
        activity_type: 'status_change',
        activity_name: 'Thay đổi trạng thái',
        activity_description: contract.contract_status_name,
        activity_date: contract.updated_at,
        actor_name: contract.sales_employee_name || 'System'
      }
    ]

    if (contract.sign_date) {
      mockActivities.push({
        activity_type: 'contract_signed',
        activity_name: 'Ký hợp đồng',
        activity_description: `Hợp đồng được ký ngày ${contract.sign_date}`,
        activity_date: contract.sign_date,
        actor_name: contract.sales_employee_name || 'System'
      })
    }

    await connection.end()

    return {
      ...contract,
      participants: participantRows,
      items: itemRows,
      attachments: attachmentRows,
      payments: mockPayments,
      notes: noteRows,
      activities: mockActivities.sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
    }
  } catch (error) {
    await connection.end()
    console.error('❌ Error fetching contract detail:', error)
    throw error
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

    console.log(`📄 Getting contract detail ${contractId} for email:`, email)

    // Debug data trước
    const debugInfo = await debugContractData(contractId, email)
    console.log('🔍 Debug info:', debugInfo)

    // Lấy chi tiết hợp đồng
    const contractDetail = await getContractDetailByIdAndEmail(contractId, email)

    if (!contractDetail) {
      console.log('❌ Contract not found or access denied')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập',
          debug: debugInfo
        },
        { status: 404 }
      )
    }

    console.log('✅ Contract detail found:', contractDetail.contract_number)

    return NextResponse.json({
      success: true,
      data: contractDetail
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