-- Fix remaining security issues

-- 1. Remove overly permissive profile access policy
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- 2. Fix conversations policies to remove NULL user_id loophole
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

-- Create secure conversation policies without NULL loopholes
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure conversations table has user_id as NOT NULL for security
-- This prevents NULL user_id entries that could bypass RLS
ALTER TABLE public.conversations ALTER COLUMN user_id SET NOT NULL;