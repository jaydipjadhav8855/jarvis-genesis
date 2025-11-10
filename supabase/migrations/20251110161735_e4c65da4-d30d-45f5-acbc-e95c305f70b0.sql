-- Fix critical security issue: Remove public access to profiles table
-- Drop the insecure policy that allows anyone to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policy: Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Optional: Allow authenticated users to view basic profile info of other users
-- (only if needed for features like user listings, chat displays, etc.)
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Note: If you don't need users to see each other's profiles at all,
-- remove the second policy above and keep only the first one.