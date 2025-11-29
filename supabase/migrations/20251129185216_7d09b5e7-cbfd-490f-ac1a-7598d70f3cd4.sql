-- Add RLS policies to allow authenticated users to insert, update, and delete patents
CREATE POLICY "Authenticated users can insert patents" 
ON public.patents 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patents" 
ON public.patents 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete patents" 
ON public.patents 
FOR DELETE 
TO authenticated 
USING (true);