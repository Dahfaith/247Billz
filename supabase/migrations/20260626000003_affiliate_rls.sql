-- RLS policies for affiliate_profiles

-- Users can view their own affiliate profile
CREATE POLICY "Users can view their own affiliate profile" ON affiliate_profiles FOR SELECT USING (
    user_id = auth.uid()
);

-- Users can insert their own affiliate profile
-- Enforce that revenue_generated and commission_due are exactly 0.00 upon creation
-- and referrals_count is 0
CREATE POLICY "Users can insert their own affiliate profile" ON affiliate_profiles FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    revenue_generated = 0.00 AND
    commission_due = 0.00 AND
    referrals_count = 0
);

-- (Updates will be handled by secure backend endpoints or triggers, not public RLS)
