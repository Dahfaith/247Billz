import { getAdminUsers } from '@/app/actions/admin'
import { AdminUsersClient } from './users-client'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const { success, users } = await getAdminUsers()

  return (
    <AdminUsersClient initialUsers={success ? (users || []) : []} />
  )
}
