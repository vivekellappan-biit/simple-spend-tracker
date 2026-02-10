ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS primary_color TEXT NOT NULL DEFAULT 'emerald';
