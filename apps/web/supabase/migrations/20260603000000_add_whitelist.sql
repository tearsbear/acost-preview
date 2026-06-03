CREATE TABLE IF NOT EXISTS public.whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    product_description TEXT,
    product_url TEXT
);

-- Enable RLS
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;

-- Allow public insertion
CREATE POLICY "Allow public insert to whitelist" ON public.whitelist
    FOR INSERT WITH CHECK (true);

-- Only allow service role to read/update/delete (or add specific policies if needed)
-- By default, RLS blocks everything else if no policy is defined.
