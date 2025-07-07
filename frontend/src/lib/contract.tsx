import { connectDB } from './database'

export interface Contract {
  id: number
  contract_number: string
  client_id: number
  contract_type_id: number
  start_date: string
  end_date: string
  total_value: number
  description?: string
  contract_status_id: number
  sign_date?: string
  department_id?: number
  sales_employee_id?: number
  created_at: string
  updated_at: string
  
  // Joined data
  contract_type_name?: string
  contract_status_name?: string
  contract_status_code?: string
  client_name?: string
  client_email?: string
}

// Lấy hợp đồng theo email client
export async function getContractsByClientEmail(email: string): Promise<Contract[]> {
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
    console.log(`📄 Found ${(rows as any[]).length} contracts for email ${email}`)
    return rows as Contract[]
  } catch (error) {
    await connection.end()
    console.error('❌ Error fetching contracts by email:', error)
    throw error
  }
}

// Lấy chi tiết hợp đồng theo ID và email
export async function getContractByIdAndEmail(contractId: number, email: string): Promise<Contract | null> {
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
      WHERE c.id = ? AND cl.email = ?
      LIMIT 1
    `, [contractId, email])
    
    await connection.end()
    const contract = (rows as any[])[0] || null
    console.log(`📄 Contract ${contractId} for ${email}:`, contract ? 'Found' : 'Not found')
    return contract
  } catch (error) {
    await connection.end()
    console.error('❌ Error fetching contract by ID and email:', error)
    throw error
  }
}