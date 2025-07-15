import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'contract_management',
  port: parseInt(process.env.DB_PORT || '3306'),
}

export async function connectDB() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    console.log('✅ Database connected successfully')
    return connection
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw new Error('Không thể kết nối database')
  }
}

export async function getClientByEmail(email: string) {
  const connection = await connectDB()
  try {
    const [rows] = await connection.execute(
      'SELECT id, name, email, password, phone, address, avatar, birth, created_at, updated_at FROM clients WHERE email = ? LIMIT 1',
      [email]
    )
    await connection.end()
    console.log('🔍 Client query result:', (rows as any[]).length > 0 ? 'Client found' : 'Client not found')
    return (rows as any[])[0] || null
  } catch (error) {
    await connection.end()
    console.error('❌ Client query error:', error)
    throw error
  }
}

// Tạo client mới - chỉ cần 4 field chính
export async function createClient(clientData: {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
}) {
  const connection = await connectDB()
  try {
    const [result] = await connection.execute(
      `INSERT INTO clients (name, email, password, phone, address, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        clientData.name,
        clientData.email,
        clientData.password,
        clientData.phone || null,
        clientData.address || null
      ]
    )
    await connection.end()
    console.log('✅ Client created in database')
    return result
  } catch (error) {
    await connection.end()
    console.error('❌ Client insert error:', error)
    
    if ((error as any).code === 'ER_DUP_ENTRY') {
      throw new Error('Email đã được sử dụng')
    }
    
    throw error
  }
}
