// frontend/src/app/api/contracts/route.tsx - Updated with Pagination
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { connectDB } from '@/lib/database'

// Function lấy hợp đồng theo email với phân trang
async function getContractsByEmail(
  email: string, 
  page: number = 1, 
  limit: number = 12,
  search: string = '',
  status: string = '',
  sortBy: string = 'created_at',
  sortOrder: string = 'desc'
) {
  const connection = await connectDB()
  try {
    const offset = (page - 1) * limit
    
    // Build search conditions
    let searchCondition = ''
    let searchParams: any[] = []
    
    if (search) {
      searchCondition = ` AND (
        c.contract_number LIKE ? OR 
        ct.name LIKE ? OR 
        c.description LIKE ?
      )`
      searchParams = [`%${search}%`, `%${search}%`, `%${search}%`]
    }
    
    // Build status condition
    let statusCondition = ''
    let statusParams: any[] = []
    
    if (status) {
      statusCondition = ` AND cs.code = ?`
      statusParams = [status]
    }
    
    // Build sort condition
    const allowedSortFields = ['created_at', 'contract_number', 'total_value', 'start_date', 'end_date']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM contracts c
      LEFT JOIN contract_types ct ON c.contract_type_id = ct.id
      LEFT JOIN contract_statuses cs ON c.contract_status_id = cs.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE cl.email = ?
      ${searchCondition}
      ${statusCondition}
    `
    
    const [countResult] = await connection.execute(
      countQuery, 
      [email, ...searchParams, ...statusParams]
    )
    const total = (countResult as any[])[0]?.total || 0
    
    // Get paginated data
    const dataQuery = `
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
      ${searchCondition}
      ${statusCondition}
      ORDER BY c.${sortField} ${order}
      LIMIT ? OFFSET ?
    `
    
    const [rows] = await connection.execute(
      dataQuery,
      [email, ...searchParams, ...statusParams, limit, offset]
    )
    
    await connection.end()
    
    const contractsArray = rows as any[]
    const totalPages = Math.ceil(total / limit)
    
    console.log(`📄 Found ${contractsArray.length} contracts (page ${page}/${totalPages}) for email ${email}`)
    
    return {
      data: contractsArray,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        total_pages: totalPages,
        from: offset + 1,
        to: Math.min(offset + limit, total),
        has_next_page: page < totalPages,
        has_prev_page: page > 1
      }
    }
  } catch (error) {
    await connection.end()
    console.error('❌ Error fetching contracts by email:', error)
    throw error
  }
}

// Function lấy danh sách contract statuses để filter
async function getContractStatuses() {
  const connection = await connectDB()
  try {
    const [rows] = await connection.execute(`
      SELECT DISTINCT code, name 
      FROM contract_statuses 
      ORDER BY name ASC
    `)
    await connection.end()
    return rows as any[]
  } catch (error) {
    await connection.end()
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Special endpoint để lấy contract statuses
    if (searchParams.get('action') === 'get-statuses') {
      const statuses = await getContractStatuses()
      return NextResponse.json({
        success: true,
        data: statuses
      })
    }
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
        { status: 400 }
      )
    }

    console.log('📋 Getting contracts with pagination:', { 
      email, page, limit, search, status, sortBy, sortOrder 
    })

    // Lấy danh sách hợp đồng có phân trang
    const result = await getContractsByEmail(email, page, limit, search, status, sortBy, sortOrder)

    return NextResponse.json({
      success: true,
      ...result,
      message: result.data.length > 0 
        ? `Tìm thấy ${result.pagination.total} hợp đồng` 
        : 'Chưa có hợp đồng nào'
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