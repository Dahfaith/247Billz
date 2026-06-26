import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOverdueReminderEmail } from '@/app/actions/email';

export async function GET(req: NextRequest) {
  // Vercel Cron authorization (optional but recommended)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get today's date formatted (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Find invoices that are overdue and not paid/cancelled/draft
    const { data: overdueInvoices, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        business:businesses(id, name, owner_id),
        client:clients(name, email),
        items:invoice_items(quantity, price)
      `)
      .lt('due_date', today)
      .not('status', 'in', '("paid","draft","cancelled")');

    if (error) throw error;

    let emailsSent = 0;
    const errors: any[] = [];

    for (const invoice of overdueInvoices || []) {
      if (invoice.client?.email) {
        try {
          const result = await sendOverdueReminderEmail(invoice);
          if (result.success) {
            emailsSent++;
          } else {
            errors.push({ invoice: invoice.id, error: result.error });
          }
        } catch (e: any) {
          errors.push({ invoice: invoice.id, error: e.message });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: overdueInvoices?.length || 0,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Cron Reminder Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
