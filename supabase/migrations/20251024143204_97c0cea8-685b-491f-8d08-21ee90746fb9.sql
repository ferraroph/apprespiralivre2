-- Create squads tables
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 10,
  squad_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('leader', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.squad_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_messages ENABLE ROW LEVEL SECURITY;

-- Policies for squads
CREATE POLICY "Anyone can view squads" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Leaders can update squads" ON public.squads FOR UPDATE 
  USING (id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid() AND role = 'leader'));

-- Policies for squad_members
CREATE POLICY "Squad members can view membership" ON public.squad_members FOR SELECT
  USING (squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid()));

-- Policies for squad_messages
CREATE POLICY "Squad members can view messages" ON public.squad_messages FOR SELECT
  USING (squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid()));

CREATE POLICY "Squad members can send messages" ON public.squad_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    squad_id IN (SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid())
  );

-- Enable realtime for squad messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.squad_messages;