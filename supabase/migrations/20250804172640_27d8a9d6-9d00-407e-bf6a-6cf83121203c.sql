-- Add columns for original query and cleaned query to the queries table
ALTER TABLE public.queries 
ADD COLUMN original_query_text text,
ADD COLUMN detected_language text;

-- Update existing records to have the original query text same as query_text
UPDATE public.queries 
SET original_query_text = query_text 
WHERE original_query_text IS NULL;