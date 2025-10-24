-- =====================================================
-- MVP Completion Schema Migration
-- =====================================================
-- This migration adds all required tables and policies for:
-- - AI Coach (chat_messages)
-- - Push Notifications (user_tokens)
-- - Squads System (squads, squad_members, squad_messages)
-- - In-App Purchases (purchases, profile extensions)
-- - Analytics (analytics_events)
-- - Content Management (storage bucket, admin roles)
-- =====================================================

-- =====================================================
-- 1.1 AI Coach: chat_messages table
-- =====================================================

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_chat_messages_user_created ON public.chat_messages(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'user');

-- =====================================================
-- 1.2 Push Notifications: user_tokens table
-- =====================================================

CREATE TABLE public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_user_tokens_user ON public.user_tokens(user_id);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tokens"
  ON public.user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
  ON public.user_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON public.user_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
  ON public.user_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 1.3 Squads System: squads, squad_members, squad_messages
-- =====================================================

CREATE TABLE public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 10,
  squad_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(squad_id, user_id)
);

CREATE TABLE public.squad_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_squads_streak ON public.squads(squad_streak DESC);
CREATE INDEX idx_squad_members_squad ON public.squad_members(squad_id);
CREATE INDEX idx_squad_members_user ON public.squad_members(user_id);
CREATE INDEX idx_squad_messages_squad_created ON public.squad_messages(squad_id, created_at DESC);

-- Trigger for updated_at on squads
CREATE TRIGGER update_squads_updated_at
  BEFORE UPDATE ON public.squads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 1.4 Squad Streak Function and Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_squad_streak()
RETURNS TRIGGER AS $
BEGIN
  UPDATE public.squads
  SET 
    squad_streak = (
      SELECT COALESCE(MIN(p.current_streak), 0)
      FROM public.squad_members sm
      JOIN public.progress p ON p.user_id = sm.user_id
      WHERE sm.squad_id = NEW.squad_id
    ),
    updated_at = now()
  WHERE id = NEW.squad_id;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_squad_streak
  AFTER INSERT OR UPDATE ON public.squad_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_squad_streak();

-- =====================================================
-- 1.5 RLS Policies for Squads System
-- =====================================================

-- Enable RLS
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_messages ENABLE ROW LEVEL SECURITY;

-- Squads: Anyone can view
CREATE POLICY "Anyone can view squads"
  ON public.squads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create squads"
  ON public.squads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Squad Members: Members can view membership data
CREATE POLICY "Squad members can view membership"
  ON public.squad_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.squad_members sm
      WHERE sm.squad_id = squad_members.squad_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join squads"
  ON public.squad_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave squads"
  ON public.squad_members FOR DELETE
  USING (auth.uid() = user_id);

-- Squad Messages: Members can view and send messages
CREATE POLICY "Squad members can view messages"
  ON public.squad_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.squad_members sm
      WHERE sm.squad_id = squad_messages.squad_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Squad members can send messages"
  ON public.squad_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.squad_members sm
      WHERE sm.squad_id = squad_messages.squad_id
      AND sm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 1.6 In-App Purchases: purchases table and profile extensions
-- =====================================================

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_purchases_user ON public.purchases(user_id);
CREATE INDEX idx_purchases_stripe ON public.purchases(stripe_payment_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Extend profiles table for IAP features
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS streak_freeze_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ads_removed BOOLEAN DEFAULT false;

-- =====================================================
-- 1.7 Analytics: analytics_events table
-- =====================================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);

-- Enable RLS (service role only for analytics)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- No public policies - analytics should be written via Edge Functions with service role

-- =====================================================
-- 1.8 Content Media Storage Bucket (via SQL)
-- =====================================================

-- Insert storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-media', 'content-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage
CREATE POLICY "Public can view content media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-media');

CREATE POLICY "Admins can upload content media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content-media' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update content media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'content-media' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete content media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'content-media' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 1.9 Admin Role: Add role column to profiles
-- =====================================================

-- Add role column to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update content table RLS for admin management
CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- Migration Complete
-- =====================================================
