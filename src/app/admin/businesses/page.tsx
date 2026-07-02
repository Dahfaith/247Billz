import { getAdminBusinesses } from '@/app/actions/admin'
import { AdminBusinessesClient } from './businesses-client'

export const dynamic = 'force-dynamic'

export default async function AdminBusinessesPage() {
  const { success, businesses } = await getAdminBusinesses()

  return (
    <AdminBusinessesClient initialBusinesses={success ? (businesses || []) : []} />
  )
}
