-- Add payment tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;

-- Mark existing users as paid (grandfather them in)
UPDATE public.profiles SET has_paid = TRUE;