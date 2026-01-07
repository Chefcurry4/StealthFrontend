-- Fix PUBLIC_DATA_EXPOSURE: Replace overly permissive policy with privacy-controlled access
-- Uses existing email_public column to allow users to opt-in to public visibility

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Users(US)";

-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view own profile"
ON public."Users(US)"
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can view other users' basic public info when email_public is true
-- This allows discovering other students who have opted in to be visible
CREATE POLICY "Users can view public profiles"
ON public."Users(US)"
FOR SELECT
USING (email_public = true);