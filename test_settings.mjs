import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function test() {
  console.log("Checking platform_settings...")
  const { data: existing, error: existError } = await supabase.from('platform_settings').select('*').maybeSingle()
  console.log("Existing:", existing)
  console.log("ExistError:", existError)

  const updateData = {
    enable_invoicing: false,
    enable_estimates: false,
  }

  if (existing) {
    console.log("Updating existing...")
    const { data, error } = await supabase.from('platform_settings').update(updateData).eq('id', existing.id).select()
    console.log("Update Result:", data)
    console.log("Update Error:", error)
  } else {
    console.log("Inserting new...")
    const { data, error } = await supabase.from('platform_settings').insert([updateData]).select()
    console.log("Insert Result:", data)
    console.log("Insert Error:", error)
  }
}

test()
