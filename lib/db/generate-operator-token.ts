import { trainDb } from '@/lib/db/train-db'
import { trainUsers } from '@/lib/db/train-schema'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kmrl-sih-2025-secret-key'

async function generateOperatorToken() {
  try {
    console.log('🔐 Generating operator token...')
    
    // Find the operator user
    const [user] = await trainDb
      .select()
      .from(trainUsers)
      .where(eq(trainUsers.email, 'operator@kmrl.co.in'))
      .limit(1)

    if (!user) {
      console.log('❌ Operator user not found!')
      return
    }

    console.log(`✅ Found user: ${user.name} (${user.email}) - Role: ${user.role}`)

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('🎟️ Generated Token:')
    console.log(`Bearer ${token}`)
    console.log('\n📋 Use this token in API requests:')
    console.log(`Authorization: Bearer ${token}`)
    
    // Test the token by verifying it
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log('\n✅ Token verification successful:')
      console.log(`   - User ID: ${decoded.userId}`)
      console.log(`   - Email: ${decoded.email}`)
      console.log(`   - Role: ${decoded.role}`)
      console.log(`   - Expires: ${new Date(decoded.exp * 1000).toLocaleString()}`)
    } catch (verifyError) {
      console.log('❌ Token verification failed:', verifyError)
    }

  } catch (error) {
    console.error('❌ Error generating token:', error)
  }
}

generateOperatorToken()