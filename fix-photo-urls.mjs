#!/usr/bin/env node
// One-shot fix for the 5 rows whose URL was truncated by the first run of
// update-photo-urls.mjs (regex was too greedy when the Vite hash contained '-').
// Maps the truncated public URL back to the correct stable URL based on the
// originals now in public/realisations/.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDotEnv() {
  try {
    const raw = readFileSync(join(__dirname, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const VALID_FILES = new Set(
  readdirSync(join(__dirname, "public", "realisations")).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
);

async function run() {
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: "info@etanche.com",
    password: "Etanche123",
  });
  if (authErr) {
    console.error("✗ sign-in failed:", authErr.message);
    process.exit(1);
  }

  const { data: rows, error: fetchErr } = await supabase
    .from("realisation_photos")
    .select("id,url");
  if (fetchErr) {
    console.error(fetchErr.message);
    process.exit(1);
  }

  let fixed = 0;
  for (const row of rows ?? []) {
    if (!row.url.startsWith("/realisations/")) continue;
    const filename = row.url.slice("/realisations/".length);
    if (VALID_FILES.has(filename)) continue;

    // Strip trailing "-<anything>" segments until we find a real file.
    const ext = filename.match(/\.[a-z0-9]+$/i)?.[0] ?? ".jpg";
    let stem = filename.slice(0, -ext.length);
    let target = null;
    while (stem.includes("-")) {
      stem = stem.slice(0, stem.lastIndexOf("-"));
      const candidate = `${stem}${ext}`;
      if (VALID_FILES.has(candidate)) {
        target = candidate;
        break;
      }
    }

    if (!target) {
      console.warn(`? cannot resolve ${row.url}`);
      continue;
    }

    const newUrl = `/realisations/${target}`;
    const { error: updErr } = await supabase
      .from("realisation_photos")
      .update({ url: newUrl })
      .eq("id", row.id);
    if (updErr) {
      console.error(`✗ ${row.url}:`, updErr.message);
      continue;
    }
    console.log(`✓ ${row.url}  →  ${newUrl}`);
    fixed++;
  }

  console.log(`\nDone. ${fixed} fixed.`);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
