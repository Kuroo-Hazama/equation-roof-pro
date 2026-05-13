import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns a deduped, alphabetically-sorted list of keywords already used
 * across all image-bearing tables. Used for autocomplete suggestions.
 */
export function useKeywordSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [r, s, b] = await Promise.all([
        supabase.from("realisation_photos").select("keywords").limit(1000),
        supabase.from("section_photos").select("keywords").limit(1000),
        supabase.from("blog_articles").select("cover_keywords").limit(1000),
      ]);
      const all = new Set<string>();
      const collect = (rows: { keywords?: string[] | null; cover_keywords?: string[] | null }[] | null) => {
        rows?.forEach((row) => {
          (row.keywords || row.cover_keywords || []).forEach((k) => k && all.add(k));
        });
      };
      collect(r.data as never);
      collect(s.data as never);
      collect(b.data as never);
      if (!cancelled) setSuggestions(Array.from(all).sort((a, b) => a.localeCompare(b)));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return suggestions;
}
