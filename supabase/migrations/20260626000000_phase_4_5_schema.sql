-- PHASE 4 & 5 SCHEMA UPDATE

-- 1. Platform Settings (Global Configuration & API Keys)
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Features
    enable_invoicing BOOLEAN DEFAULT true,
    enable_estimates BOOLEAN DEFAULT true,
    enable_receipts BOOLEAN DEFAULT true,
    enable_subscriptions BOOLEAN DEFAULT false,
    enable_tax_computation BOOLEAN DEFAULT true,
    enable_multi_currency BOOLEAN DEFAULT true,
    enable_multi_language BOOLEAN DEFAULT false,
    require_2fa BOOLEAN DEFAULT false,
    strict_kyc_mode BOOLEAN DEFAULT true,
    -- API Keys (Encrypted in a real production environment, but stored as text here for simplicity)
    paystack_public_key TEXT,
    paystack_secret_key TEXT,
    flutterwave_public_key TEXT,
    flutterwave_secret_key TEXT,
    resend_api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a default row for platform settings
INSERT INTO platform_settings (enable_invoicing) VALUES (true);

-- 2. CMS Pages
CREATE TYPE cms_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    status cms_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Affiliates
CREATE TYPE affiliate_status AS ENUM ('active', 'pending_payout', 'suspended');

CREATE TABLE affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    promo_code TEXT UNIQUE NOT NULL,
    referrals_count INTEGER DEFAULT 0,
    revenue_generated NUMERIC(15, 2) DEFAULT 0.00,
    commission_due NUMERIC(15, 2) DEFAULT 0.00,
    status affiliate_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Support Tickets
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_platform_settings_modtime BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_pages_modtime BEFORE UPDATE ON cms_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_profiles_modtime BEFORE UPDATE ON affiliate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_modtime BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES (Super Admin Bypasses RLS via Service Role)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow public to read published CMS pages
CREATE POLICY "Public can view published CMS pages" ON cms_pages FOR SELECT USING (status = 'published');

-- Allow business owners to view their own tickets
CREATE POLICY "Owners can view their support tickets" ON support_tickets FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can insert support tickets" ON support_tickets FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
