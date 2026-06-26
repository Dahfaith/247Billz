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
