-- FIX 1: Remove ALL existing policies on squad_members and squad_messages
DROP POLICY IF EXISTS "Squad members can view membership" ON squad_members;
DROP POLICY IF EXISTS "Users can join squads" ON squad_members;
DROP POLICY IF EXISTS "Users can leave squads" ON squad_members;

DROP POLICY IF EXISTS "Squad members can view messages" ON squad_messages;
DROP POLICY IF EXISTS "Squad members can send messages" ON squad_messages;

-- Create simple, non-recursive policies for squad_members
CREATE POLICY "Anyone authenticated can view squad_members"
ON squad_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own squad membership"
ON squad_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own squad membership"
ON squad_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create simple policies for squad_messages (no recursion)
CREATE POLICY "Authenticated users can view squad messages"
ON squad_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON squad_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- FIX 2: Add foreign key constraint to community_posts
ALTER TABLE community_posts
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

ALTER TABLE community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(user_id)
ON DELETE CASCADE;