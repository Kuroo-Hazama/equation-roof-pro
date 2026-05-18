ALTER TABLE public.realisation_photos
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.section_photos
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS cover_description text NOT NULL DEFAULT '';