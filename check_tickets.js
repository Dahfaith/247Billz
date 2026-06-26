const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rwunwfmhyeiqwhrwoqhu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dW53Zm1oeWVpcXdocndvcWh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzODI2NiwiZXhwIjoyMDk3OTE0MjY2fQ.9RwbubhVaII2tJtWSsdkCbXxjqsBLLNkKBnEAdoJ5Qs'
);

async function main() {
  const { data: tickets, error } = await supabase.from('support_tickets').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total tickets:', tickets.length);
    console.log(tickets);
  }
}
main();
