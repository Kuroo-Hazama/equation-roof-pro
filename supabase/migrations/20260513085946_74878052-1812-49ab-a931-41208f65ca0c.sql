-- Add keywords arrays to photo tables
ALTER TABLE public.realisation_photos
  ADD COLUMN IF NOT EXISTS keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.section_photos
  ADD COLUMN IF NOT EXISTS keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Add cover image alt + keywords to blog_articles
ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS cover_alt_text TEXT,
  ADD COLUMN IF NOT EXISTS cover_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Ensure alt_text column exists & is non-null with default '' on photo tables
ALTER TABLE public.realisation_photos
  ALTER COLUMN alt_text SET DEFAULT '';
UPDATE public.realisation_photos SET alt_text = '' WHERE alt_text IS NULL;
ALTER TABLE public.realisation_photos
  ALTER COLUMN alt_text SET NOT NULL;

ALTER TABLE public.section_photos
  ALTER COLUMN alt_text SET DEFAULT '';
UPDATE public.section_photos SET alt_text = '' WHERE alt_text IS NULL;
ALTER TABLE public.section_photos
  ALTER COLUMN alt_text SET NOT NULL;

-- Backfill empty alt_text from a cleaned-up file name as a sensible default
UPDATE public.realisation_photos
SET alt_text = regexp_replace(
  regexp_replace(
    regexp_replace(url, '^.*/', ''),     -- file name only
    '\.[a-zA-Z0-9]+$', ''                -- strip extension
  ),
  '[-_]+', ' ', 'g'
)
WHERE alt_text = '' OR alt_text IS NULL;

UPDATE public.section_photos
SET alt_text = regexp_replace(
  regexp_replace(
    regexp_replace(url, '^.*/', ''),
    '\.[a-zA-Z0-9]+$', ''
  ),
  '[-_]+', ' ', 'g'
)
WHERE alt_text = '' OR alt_text IS NULL;

-- Indexes for keyword search (GIN on TEXT[])
CREATE INDEX IF NOT EXISTS idx_realisation_photos_keywords
  ON public.realisation_photos USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_section_photos_keywords
  ON public.section_photos USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_blog_articles_cover_keywords
  ON public.blog_articles USING GIN(cover_keywords);