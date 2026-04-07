-- Set up the contact messages database
CREATE TABLE public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to Insert into contacts (They don't need to be authenticated to send a message)
CREATE POLICY "Enable insert for all users" ON public.contacts
    FOR INSERT
    WITH CHECK (true);

-- Explicitly disallow general read access (only admins via dashboard can see the messages)
CREATE POLICY "Disable general read access" ON public.contacts
    FOR SELECT
    USING (false);
