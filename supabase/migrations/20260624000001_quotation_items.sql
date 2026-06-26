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
