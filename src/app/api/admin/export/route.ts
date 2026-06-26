import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  const range = searchParams.get('range')
  const format = searchParams.get('format')

  // We only support CSV in this basic implementation
  if (format !== 'csv') {
    return NextResponse.json({ error: 'Only CSV format is supported at this time.' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(url, key)
  
  let csvData = ''
  let filename = ''

  try {
    if (type === 'revenue') {
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, status, payment_method, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      filename = `Revenue_Report_${range}.csv`
      csvData = 'ID,Amount,Status,Method,Date\n'
      data.forEach((row) => {
        csvData += `${row.id},${row.amount},${row.status},${row.payment_method},${row.created_at}\n`
      })
    } else if (type === 'growth') {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, email, subscription_tier, status, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      filename = `Platform_Growth_${range}.csv`
      csvData = 'ID,Business Name,Email,Tier,Status,Joined Date\n'
      data.forEach((row) => {
        csvData += `${row.id},"${row.name.replace(/"/g, '""')}",${row.email},${row.subscription_tier},${row.status || 'active'},${row.created_at}\n`
      })
    } else if (type === 'audit') {
      filename = `Audit_Logs_${range}.csv`
      csvData = 'Timestamp,Event Type,User ID,Details\n'
      // Mock audit log for now
      csvData += `${new Date().toISOString()},admin_login,system,Super admin logged in\n`
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
