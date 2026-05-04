-- Rewrite realisation_photos.url
--   /assets/<filename>-<hash>.<ext>  ->  /realisations/<filename>.<ext>
--
-- Vite emits 8-character base64-url hashes (e.g. cpam-5-YaWwxs-m.jpg).
-- The hash itself can contain '-' so we anchor on exactly 8 trailing chars
-- to avoid stripping characters from the basename when '(.+)' would be
-- greedy.
--
-- Run in the Supabase SQL Editor AFTER moving the originals from
-- src/assets/realisations/ to public/realisations/.

UPDATE public.realisation_photos
SET    url = regexp_replace(
              url,
              '^/assets/(.+)-[A-Za-z0-9_-]{8}\.(jpe?g|png|webp)$',
              '/realisations/\1.\2'
           )
WHERE  url ~ '^/assets/.+-[A-Za-z0-9_-]{8}\.(jpe?g|png|webp)$';

-- Verify
SELECT id, url FROM public.realisation_photos ORDER BY url;
