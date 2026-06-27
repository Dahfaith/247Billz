// Backfill short_token for invoices and quotations
// Usage: node scripts/backfill-short-tokens.js

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const { customAlphabet } = require('nanoid')

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    content.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eq = trimmed.indexOf('=')
      if (eq === -1) return
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = val.replace(/^"|"$/g, '')
    })
  } catch (err) {
    // ignore
  }
}

// Try to load common env files if vars not present
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  loadEnvFile(path.resolve(process.cwd(), '.env.local'))
  loadEnvFile(path.resolve(process.cwd(), '.env'))
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or place them in .env.local)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

async function backfillTable(tableName) {
  console.log(`Backfilling ${tableName}...`)
  let updated = 0
  // Fetch rows that don't have short_token
  const { data: rows, error } = await supabase
    .from(tableName)
    .select('id')
    .is('short_token', null)
    .limit(1000)

  if (error) throw error
  if (!rows || rows.length === 0) {
    console.log(`No rows to backfill in ${tableName}`)
    return 0
  }

  for (const row of rows) {
    let attempts = 0
    while (attempts < 5) {
      const token = nano()
      try {
        const { error: upErr } = await supabase
          .from(tableName)
          .update({ short_token: token })
          .eq('id', row.id)

        if (upErr) {
          // Unique violation or other error -> retry
          attempts++
          console.warn(`Update attempt ${attempts} failed for id=${row.id}: ${upErr.message}`)
          continue
        }
        updated++
        break
      } catch (e) {
        attempts++
        console.warn(`Attempt ${attempts} exception for id=${row.id}: ${e.message}`)
      }
    }
  }

  console.log(`Updated ${updated} rows in ${tableName}`)
  return updated
}

;(async () => {
  try {
    const invs = await backfillTable('invoices')
    const quotes = await backfillTable('quotations')
    console.log('Backfill complete:', { invoices: invs, quotations: quotes })
    process.exit(0)
  } catch (err) {
    console.error('Backfill failed:', err)
    process.exit(2)
  }
})()
