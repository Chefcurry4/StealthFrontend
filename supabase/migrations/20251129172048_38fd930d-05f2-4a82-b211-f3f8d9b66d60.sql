-- Enable authenticated users to manage their saved courses
CREATE POLICY "Users can insert their own saved courses"
ON "user_saved_courses(US-C)"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved courses"
ON "user_saved_courses(US-C)"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved courses"
ON "user_saved_courses(US-C)"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable authenticated users to manage their saved labs
CREATE POLICY "Users can insert their own saved labs"
ON "user_saved_labs(US-L)"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved labs"
ON "user_saved_labs(US-L)"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved labs"
ON "user_saved_labs(US-L)"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable authenticated users to manage their saved programs
CREATE POLICY "Users can insert their own saved programs"
ON "user_saved_programs(US-P)"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved programs"
ON "user_saved_programs(US-P)"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved programs"
ON "user_saved_programs(US-P)"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable authenticated users to manage their own learning agreements
CREATE POLICY "Users can insert their own learning agreements"
ON "Learning_agreements(LA)"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning agreements"
ON "Learning_agreements(LA)"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning agreements"
ON "Learning_agreements(LA)"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable authenticated users to manage their own user profile
CREATE POLICY "Users can update their own profile"
ON "Users(US)"
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON "Users(US)"
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Update learning agreement courses policy to check ownership via agreement
CREATE POLICY "Users can update their agreement courses"
ON "learning_agreement_courses"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Learning_agreements(LA)"
    WHERE id = agreement_id AND user_id = auth.uid()
  )
);