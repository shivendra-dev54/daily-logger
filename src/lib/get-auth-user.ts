import { db } from '@/db'
import { users } from '@/db/Schemas/Users.schema'
import { eq } from 'drizzle-orm'

export async function getAuthUser(request: Request) {
  const userId = request.headers.get('x-user-id')
  
  
  if (!userId) {
    return null
  }

  const userIdNum = Number(userId)
  
  if (isNaN(userIdNum)) {
    return null
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      full_name: users.full_name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userIdNum))
    .limit(1)


  return user ?? null
}