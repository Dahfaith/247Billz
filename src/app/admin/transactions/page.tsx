import { getAdminTransactions } from '@/app/actions/admin'
import { TransactionsClient } from './transactions-client'

export const dynamic = 'force-dynamic'

export default async function AdminTransactionsPage() {
  const { success, transactions } = await getAdminTransactions()

  return (
    <TransactionsClient initialTransactions={success ? (transactions || []) : []} />
  )
}
