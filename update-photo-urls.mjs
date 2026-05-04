#!/usr/bin/env node
// Rewrite realisation_photos.url:
//   /assets/<filename>-<hash>.jpg  ->  /realisations/<filename>.jpg
//
// Same auth flow as seed-realisations.mjs — anon key + signInWithPassword.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
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
  } catch {
    /* fall back to process env */
  }
}
loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;
const EDITOR_EMAIL = process.env.SEED_EMAIL || "info@etanche.com";
const EDITOR_PASSWORD = process.env.SEED_PASSWORD || "Etanche123";

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Vite hash is exactly 8 base64-url chars; anchoring the length avoids
// stripping characters when the hash itself contains '-'.
const HASHED_RE = /^\/assets\/(.+)-[A-Za-z0-9_-]{8}\.(jpe?g|png|webp)$/;

async function run() {
  console.log(`Connecting to ${SUPABASE_URL}`);
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: EDITOR_EMAIL,
    password: EDITOR_PASSWORD,
  });
  if (authErr || !authData?.session) {
    console.error(`✗ sign-in failed: ${authErr?.message || "no session"}`);
    process.exit(1);
  }
  console.log(`✓ signed in (user ${authData.user?.id})\n`);

  const { data: rows, error: fetchErr } = await supabase
    .from("realisation_photos")
    .select("id,url");
  if (fetchErr) {
    console.error("✗ fetch failed:", fetchErr.message);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;
  for (const row of rows ?? []) {
    const m = row.url.match(HASHED_RE);
    if (!m) {
      skipped++;
      continue;
    }
    const newUrl = `/realisations/${m[1]}.${m[2]}`;
    if (newUrl === row.url) {
      skipped++;
      continue;
    }
    const { error: updErr } = await supabase
      .from("realisation_photos")
      .update({ url: newUrl })
      .eq("id", row.id);
    if (updErr) {
      console.error(`✗ update ${row.id} failed:`, updErr.message);
      continue;
    }
    console.log(`✓ ${row.url}  →  ${newUrl}`);
    updated++;
  }

  console.log(`\nDone. ${updated} updated, ${skipped} unchanged.`);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
