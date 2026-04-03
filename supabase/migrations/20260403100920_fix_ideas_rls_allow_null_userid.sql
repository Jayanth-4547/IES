/*
  # Fix Ideas RLS - Allow Null User ID

  1. Security Updates
    - Fix RLS policies to allow anonymous users to insert ideas
    - The previous policy was restrictive even with NULL user_id
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ideas' AND policyname = 'Authenticated users can insert ideas') THEN
    DROP POLICY "Authenticated users can insert ideas" ON ideas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ideas' AND policyname = 'Anyone can read ideas') THEN
    DROP POLICY "Anyone can read ideas" ON ideas;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ideas' AND policyname = 'Users can update own ideas') THEN
    DROP POLICY "Users can update own ideas" ON ideas;
  END IF;
END $$;

CREATE POLICY "Allow anyone to insert ideas"
  ON ideas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anyone to read ideas"
  ON ideas
  FOR SELECT
  TO anon, authenticated
  USING (true);