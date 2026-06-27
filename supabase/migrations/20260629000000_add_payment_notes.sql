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
