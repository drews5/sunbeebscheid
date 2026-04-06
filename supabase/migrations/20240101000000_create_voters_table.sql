-- Set up the main voter database
CREATE TABLE public.voters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    student_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;

-- Allow anyone to Insert into voters (They don't need to be authenticated to sign up)
CREATE POLICY "Enable insert for all users" ON public.voters
    FOR INSERT
    WITH CHECK (true);

-- Explicitly disallow general read access (only admins via dashboard can see the list of voters)
CREATE POLICY "Disable general read access" ON public.voters
    FOR SELECT
    USING (false);
