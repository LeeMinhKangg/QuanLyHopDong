import bcrypt from 'bcryptjs'
import { getClientByEmail, createClient } from './database'

export interface Client {
  id: number
  name: string
  email: string
  phone?: string | null
  address?: string | null
  avatar?: string | null
  birth?: string | null
  created_at?: string
  updated_at?: string
}

export async function authenticateClient(email: string, password: string): Promise<Client | null> {
  try {
    console.log('🔐 Authenticating client:', email)
    
    const client = await getClientByEmail(email)
    
    if (!client) {
      console.log('❌ Client not found')
      return null
    }

    console.log('🔍 Client found, checking password...')
    
    if (!client.password) {
      console.log('❌ Client does not have password field')
      return null
    }

    // So sánh password (bcrypt hoặc plaintext)
    let isValidPassword = false
    
    if (client.password.startsWith('$2')) {
      // Là bcrypt hash
      isValidPassword = await bcrypt.compare(password, client.password)
    } else {
      // Là plaintext (cho test)
      isValidPassword = password === client.password
      console.log('⚠️ Warning: Using plaintext password comparison')
    }
    
    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return null
    }

    console.log('✅ Client authentication successful')
    // Trả về client không bao gồm password
    const { password: _, ...clientWithoutPassword } = client
    return clientWithoutPassword
  } catch (error) {
    console.error('❌ Client authentication error:', error)
    return null
  }
}

export async function registerClient(clientData: {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
}): Promise<Client | null> {
  try {
    console.log('📝 Registering client:', clientData.email)
    
    // Kiểm tra email đã tồn tại
    const existingClient = await getClientByEmail(clientData.email)
    if (existingClient) {
      throw new Error('Email đã được sử dụng')
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(clientData.password, 12)

    // Tạo client mới
    await createClient({
      ...clientData,
      password: hashedPassword,
    })

    // Lấy client vừa tạo
    const newClient = await getClientByEmail(clientData.email)
    if (newClient) {
      const { password: _, ...clientWithoutPassword } = newClient
      console.log('✅ Client registration successful')
      return clientWithoutPassword
    }

    return null
  } catch (error) {
    console.error('❌ Client registration error:', error)
    throw error
  }
}