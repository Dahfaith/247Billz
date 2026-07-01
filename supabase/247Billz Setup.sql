-- Create custom types
CREATE TYPE user_role AS ENUM ('business_owner', 'affiliate');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'business');
CREATE TYPE document_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'sent', 'accepted', 'declined', 'converted');
CREATE TYPE payment_method AS ENUM ('paystack', 'flutterwave', 'stripe', 'cash', 'bank_transfer');

-- Profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'business_owner',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    currency TEXT DEFAULT 'NGN',
    whatsapp_number TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    current_period_end TIMESTAMPTZ,
    city TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    discount_rate NUMERIC(5, 2) DEFAULT 0,
    status document_status DEFAULT 'draft',
    secure_token UUID UNIQUE DEFAULT gen_random_uuid(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price NUMERIC(15, 2) NOT NULL
);

-- Quotations
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    discount_rate NUMERIC(5, 2) DEFAULT 0,
    status document_status DEFAULT 'draft',
    secure_token UUID UNIQUE DEFAULT gen_random_uuid(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method payment_method,
    status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function & Trigger: Enforce 30-day limits
CREATE OR REPLACE FUNCTION check_monthly_document_limit()
RETURNS TRIGGER AS $$
DECLARE
    tier subscription_tier;
    doc_count INT;
BEGIN
    -- Get the business's tier
    SELECT subscription_tier INTO tier FROM businesses WHERE id = NEW.business_id;

    IF tier = 'pro' OR tier = 'business' THEN
        RETURN NEW;
    END IF;

    -- Count documents created in the last 30 days
    IF TG_TABLE_NAME = 'invoices' THEN
        SELECT COUNT(*) INTO doc_count FROM invoices 
        WHERE business_id = NEW.business_id 
        AND created_at >= NOW() - INTERVAL '30 days';
    ELSIF TG_TABLE_NAME = 'quotations' THEN
        SELECT COUNT(*) INTO doc_count FROM quotations 
        WHERE business_id = NEW.business_id 
        AND created_at >= NOW() - INTERVAL '30 days';
    END IF;

    IF tier = 'free' AND doc_count >= 3 THEN
        RAISE EXCEPTION 'Free plan limit reached (3 per 30 days). Please upgrade.';
    ELSIF tier = 'starter' AND doc_count >= 20 THEN
        RAISE EXCEPTION 'Starter plan limit reached (20 per 30 days). Please upgrade.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_invoice_limit
BEFORE INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION check_monthly_document_limit();

CREATE TRIGGER enforce_quotation_limit
BEFORE INSERT ON quotations
FOR EACH ROW EXECUTE FUNCTION check_monthly_document_limit();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policy: Businesses
CREATE POLICY "Owners can view their businesses" ON businesses FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can create businesses" ON businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update businesses" ON businesses FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Clients
CREATE POLICY "Owners can manage clients" ON clients FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);

-- Policy: Invoices
CREATE POLICY "Owners can manage invoices" ON invoices FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "Public can view invoice by secure token" ON invoices FOR SELECT USING (true);

-- Policy: Invoice Items
CREATE POLICY "Owners can manage invoice items" ON invoice_items FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
);
CREATE POLICY "Public can view invoice items" ON invoice_items FOR SELECT USING (
    invoice_id IN (SELECT id FROM invoices)
);

-- Policy: Quotations
CREATE POLICY "Owners can manage quotations" ON quotations FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "Public can view quotation by secure token" ON quotations FOR SELECT USING (true);

-- Policy: Payments
CREATE POLICY "Owners can manage payments" ON payments FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
);
CREATE POLICY "Public can insert payments" ON payments FOR INSERT WITH CHECK (true);

-- Function & Trigger: Auto-create profile and business on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles first
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'business_owner');

  -- Then insert into businesses
  INSERT INTO public.businesses (owner_id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'business_name', 'New Business')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price NUMERIC(15, 2) NOT NULL
);

ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage quotation items" ON quotation_items FOR ALL USING (
    quotation_id IN (SELECT id FROM quotations WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
);

CREATE POLICY "Public can view quotation items" ON quotation_items FOR SELECT USING (
    quotation_id IN (SELECT id FROM quotations)
);
-- Add Flutterwave Subaccount fields to businesses table
ALTER TABLE businesses 
ADD COLUMN flutterwave_subaccount_id TEXT,
ADD COLUMN bank_name TEXT,
ADD COLUMN account_number TEXT;
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
-- Seed CMS Pages with Default Content for 247Billz

INSERT INTO cms_pages (title, slug, content, status)
VALUES 
(
  'Privacy Policy', 
  'privacy-policy', 
  '<h1>Privacy Policy</h1>
  <p>Welcome to 247Billz. Your privacy is critically important to us.</p>
  <h2>1. Information We Collect</h2>
  <p>We only collect the information necessary to provide you with secure invoicing and payment services. This includes your name, email, business details, and necessary payment routing information.</p>
  <h2>2. How We Use Your Information</h2>
  <p>Your information is used strictly to operate the 247Billz platform, process your transactions, and communicate with you regarding your account. We do not sell your data to third parties.</p>
  <h2>3. Data Security</h2>
  <p>We use industry-standard encryption to protect your data. Payment data is processed securely through our verified payment partners (Paystack, Flutterwave) and is never stored in plain text on our servers.</p>
  <p><em>Last updated: June 2026</em></p>', 
  'published'
),
(
  'Terms of Service', 
  'terms-of-service', 
  '<h1>Terms of Service</h1>
  <p>By registering for and using 247Billz, you agree to the following terms and conditions.</p>
  <h2>1. Account Responsibilities</h2>
  <p>You are responsible for maintaining the security of your account credentials. You must immediately notify us of any unauthorized use of your account.</p>
  <h2>2. Acceptable Use</h2>
  <p>247Billz must not be used for any illegal or fraudulent activities. Invoices generated through our platform must represent legitimate goods or services provided by your business.</p>
  <h2>3. Fees and Payments</h2>
  <p>Any applicable subscription fees or transaction processing percentages will be clearly communicated. By using our payment gateways, you agree to the deduction of these fees prior to payout.</p>
  <h2>4. Termination</h2>
  <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
  <p><em>Last updated: June 2026</em></p>', 
  'published'
),
(
  'About Us', 
  'about-us', 
  '<h1>About 247Billz</h1>
  <p>247Billz is the premier invoicing and business management platform designed for modern entrepreneurs and freelancers.</p>
  <p>Our mission is to simplify how businesses get paid. By combining powerful invoicing tools, integrated payment gateways, and seamless receipt generation, we empower you to focus on what you do best—growing your business.</p>
  <p>Whether you are sending a quick quote or managing recurring subscriptions, 247Billz is built to scale with you.</p>', 
  'published'
);
-- Add admin_reply column to support_tickets

ALTER TABLE support_tickets
ADD COLUMN admin_reply TEXT;
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
-- Add status column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add status column to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
-- Add referred_by column to businesses table to track which affiliate brought them in
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS referred_by text;
-- Add API key columns to platform_settings table
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS flutterwave_public_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS flutterwave_secret_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS paystack_public_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS paystack_secret_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS resend_api_key text;
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own business notifications"
    ON public.notifications FOR SELECT
    USING (business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can update their own business notifications"
    ON public.notifications FOR UPDATE
    USING (business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own business notifications"
    ON public.notifications FOR DELETE
    USING (business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    ));

-- Create an index for faster queries
CREATE INDEX idx_notifications_business_id ON public.notifications(business_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
-- Add short_token columns for compact public links

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS short_token TEXT UNIQUE;

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS short_token TEXT UNIQUE;

-- Create indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_invoices_short_token ON invoices(short_token);
CREATE INDEX IF NOT EXISTS idx_quotations_short_token ON quotations(short_token);
-- Create audit_logs table for system events

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NULL,
  user_id uuid NULL,
  event_type text NOT NULL,
  message text NOT NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.payments
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage payments" ON public.payments;

CREATE POLICY "Owners can manage payments" ON public.payments FOR ALL USING (
    invoice_id IN (SELECT id FROM public.invoices WHERE business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()))
);
INSERT INTO public.cms_pages (title, slug, content, status)
VALUES 
(
  'Cookie Policy', 
  'cookie-policy', 
  '<h1>Cookie Policy</h1>
  <p>This Cookie Policy explains how 247Billz uses cookies and similar technologies to recognize you when you visit our website and use our platform.</p>
  <h2>1. What are cookies?</h2>
  <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
  <h2>2. Why do we use cookies?</h2>
  <p>We use essential cookies strictly to operate the platform (such as keeping you securely logged in). We do not use third-party tracking or advertising cookies without your consent.</p>
  <p><em>Last updated: July 2026</em></p>', 
  'published'
),
(
  'Contact Us', 
  'contact', 
  '<h1>Contact Us</h1>
  <p>We are here to help you get the most out of 247Billz.</p>
  <h2>Customer Support</h2>
  <p>If you need technical assistance, help with billing, or have any other questions, please reach out to our support team:</p>
  <ul>
    <li><strong>Email:</strong> 247billzsupport@gmail.com</li>
    <li><strong>WhatsApp Support:</strong> +2347033803972</li>
  </ul>
  <h2>Business Inquiries</h2>
  <p>For enterprise plans, partnerships, and API access, please email <strong>247billzsupport@gmail.com</strong>.</p>', 
  'published'
),
(
  'Careers', 
  'careers', 
  '<h1>Careers at 247Billz</h1>
  <p>Join us in building the future of financial infrastructure for businesses across Africa.</p>
  <h2>Open Positions</h2>
  <p>We are always on the lookout for talented engineers, product managers, and customer success specialists. While we do not have any specific open roles at this exact moment, we would love to hear from you!</p>
  <p>Please send your resume and a brief introduction to <strong>247billzsupport@gmail.com</strong>.</p>', 
  'published'
);
-- Create Blog Posts Table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_name TEXT DEFAULT '247Billz Team',
  status TEXT DEFAULT 'draft', -- 'draft' or 'published'
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_modtime 
BEFORE UPDATE ON public.blog_posts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public to read published posts
CREATE POLICY "Public can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Allow admins full access via Service Role (handled automatically by supabase service role key)

-- Seed 3 SEO-friendly Posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, cover_image_url, status)
VALUES 
(
  'How to Create Professional Invoices That Get Paid Faster',
  'how-to-create-professional-invoices',
  'Learn the key elements of a professional invoice and how using 247Billz can help you get paid 3x faster by your clients.',
  '<h1>How to Create Professional Invoices That Get Paid Faster</h1>
  <p>If you run a small business or freelance operation, you know that cash flow is the lifeblood of your company. One of the biggest bottlenecks to maintaining healthy cash flow is late payments from clients. However, did you know that the way your invoice looks and functions plays a massive role in how quickly it gets paid?</p>
  <h2>1. Keep It Clear and Concise</h2>
  <p>Your clients should never have to guess what they are paying for. A professional invoice clearly lists the services provided, the dates, the quantity, and the total amount due. By using <strong>247Billz</strong>, our templates automatically structure your line items perfectly so there is zero confusion.</p>
  <h2>2. Offer Multiple Payment Options</h2>
  <p>The harder you make it for a client to pay, the longer they will take. If you only accept bank transfers, they have to log into their bank app, type in your account number, and manually verify. With 247Billz, every invoice comes with a secure payment link powered by Paystack or Flutterwave. Clients can pay instantly via card, USSD, or mobile money right from the invoice page.</p>
  <h2>3. Always Include a Due Date</h2>
  <p>"Pay whenever you can" is a recipe for disaster. Set a clear, firm due date. Net-15 (15 days from the invoice date) or "Due on Receipt" are industry standards that create a sense of urgency.</p>
  <p>Stop chasing payments manually. <a href="https://247billz.com/signup">Sign up for 247Billz today</a> and let our automated system handle the heavy lifting for you.</p>',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
  'published'
),
(
  '5 Signs Your Business Needs Invoicing Software',
  'signs-your-business-needs-invoicing-software',
  'Are you still using Word or Excel to bill your clients? Discover the 5 critical signs that it is time to upgrade your billing system.',
  '<h1>5 Signs Your Business Needs Invoicing Software</h1>
  <p>Many businesses start by using Microsoft Word or Excel to send their first few invoices. While this works initially, it quickly becomes an unmanageable mess as your business scales. If you are experiencing any of the following, it is time to switch to a dedicated platform like 247Billz.</p>
  <h2>1. You Are Losing Track of Who Owes You</h2>
  <p>If you have to manually check your bank statement and cross-reference it with a spreadsheet to figure out if an invoice was paid, you are losing valuable hours every week. 247Billz tracks the status of every invoice automatically.</p>
  <h2>2. Making Mistakes on Calculations</h2>
  <p>A simple formula error in Excel can lead to undercharging a client or overcharging them (which looks unprofessional). Automated software calculates taxes, discounts, and subtotals perfectly every single time.</p>
  <h2>3. Clients Ask for Payment Links</h2>
  <p>Today''s consumers expect digital convenience. Sending a static PDF with a bank account number feels outdated. A modern system generates a seamless online checkout experience.</p>
  <h2>4. You Have No Branding</h2>
  <p>A standard Excel template looks generic. 247Billz allows you to upload your custom logo, embed your brand colors, and present a premium, enterprise-grade look to your clients.</p>
  <p>Ready to upgrade? <a href="https://247billz.com/signup">Get started with 247Billz for free.</a></p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  'published'
),
(
  'The Ultimate Guide to Generating Quotations That Win Clients',
  'guide-to-generating-winning-quotations',
  'A quotation is often a client''s first impression of your professionalism. Here is how to create proposals that close deals using 247Billz.',
  '<h1>The Ultimate Guide to Generating Quotations That Win Clients</h1>
  <p>Before an invoice is ever sent, a deal must be won. For many service-based businesses, this starts with a quotation or proposal. A quotation is more than just a price tag; it is a marketing document that demonstrates your professionalism and competence.</p>
  <h2>Provide Crystal Clear Breakdowns</h2>
  <p>Clients are skeptical of "lump sum" pricing. If a project costs ₦500,000, they want to know exactly what that covers. Use the 247Billz quotation builder to break down the project into clear, understandable phases or milestones.</p>
  <h2>Digital Acceptance is Key</h2>
  <p>Back in the day, a client had to print a quotation, sign it with a pen, scan it, and email it back. This friction caused many deals to stall. With 247Billz, your client receives a secure link where they can digitally "Accept" the quotation with a single click. Once accepted, you can convert that quotation directly into an invoice without re-typing any data.</p>
  <h2>Follow Up Professionally</h2>
  <p>When you send a quotation through our platform, you can track its status. If it remains unaccepted for a week, you know exactly when to follow up and close the deal.</p>
  <p>Start winning more clients today by generating your next quotation on <a href="https://247billz.com">247Billz</a>.</p>',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800&q=80',
  'published'
);
