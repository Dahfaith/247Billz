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
