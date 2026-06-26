'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function joinAffiliateProgram(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Generate a random promo code like REF-A1B2C3
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const promoCode = `REF-${randomStr}`;

  // Use business name if available, else user email
  const { data: business } = await supabase.from('businesses').select('name').eq('owner_id', user.id).single();
  const name = business?.name || user.email || 'Business Owner';

  const { error } = await supabase.from('affiliate_profiles').insert({
    user_id: user.id,
    name,
    promo_code: promoCode,
    referrals_count: 0,
    revenue_generated: 0,
    commission_due: 0
  });

  if (error) {
    console.error("Error creating affiliate profile:", error);
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/affiliate');
}
