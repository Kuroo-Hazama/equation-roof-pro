#!/usr/bin/env node
// Seed the `realisations` + `realisation_photos` tables in Supabase
// with the projects that were previously hardcoded in src/pages/Realisations.tsx
// and src/pages/Index.tsx.
//
// Usage:
//   node seed-realisations.mjs
//
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env, then
// signs in as the editor user to satisfy RLS policies. The script is
// idempotent: a realisation whose title already exists is skipped.

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
    /* no .env, fall back to process env */
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

if (!SUPABASE_URL) {
  console.error("Missing SUPABASE_URL (or VITE_SUPABASE_URL in .env).");
  process.exit(1);
}
if (!ANON_KEY) {
  console.error("Missing VITE_SUPABASE_PUBLISHABLE_KEY in .env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Hashed filenames produced by `vite build` and currently present in dist/assets.
// If a future build regenerates these hashes, re-run this seed (or migrate the
// originals into public/realisations/ for stable URLs).
const ASSET = (file) => `/assets/${file}`;

const REALISATIONS = [
  {
    title: "CPAM Nevers",
    category: "Étanchéité Bitumineuse",
    description:
      "Réfection complète de 6 toitures terrasses du siège de la CPAM. Chantier complexe nécessitant une grue GMA pour acheminer matériaux et isolant. Pose d'un complexe isolant polyuréthane 100mm + étanchéité bicouche soudée selon DTU 43.1.",
    surface: "2 500 m²",
    technique: "Bicouche soudée + isolation PU 100mm",
    year: "2022",
    location: "Nevers (58)",
    display_order: 10,
    photos: [
      { file: "cpam-1-DYfWGIUg.jpg", alt: "CPAM Nevers - vue d'ensemble", caption: "Vue d'ensemble du bâtiment CPAM avant intervention — 6 toitures terrasses sur 2 500 m²" },
      { file: "cpam-2-CnZmV6Gf.jpg", alt: "Pose isolation PU", caption: "Pose de l'isolant polyuréthane 100mm sur pare-vapeur — coefficient λ = 0,022 W/m.K" },
      { file: "cpam-3-Dd96kHgT.jpg", alt: "Soudure bitumineuse", caption: "Soudure au chalumeau de la 1ère couche bitumineuse — élastomère SBS conforme DTU 43.1" },
      { file: "cpam-4-CieoM3zy.jpg", alt: "Finition autoprotégée", caption: "Pose de la couche de finition autoprotégée par paillettes d'ardoise grise" },
      { file: "cpam-5-YaWwxs-m.jpg", alt: "Toiture terminée", caption: "Toiture livrée — garantie décennale + assurance dommages-ouvrage" },
    ],
  },
  {
    title: "Nièvre Habitat Nevers",
    category: "Étanchéité Bitumineuse",
    description:
      "Réhabilitation thermique de 3 immeubles de logements sociaux. Pose d'isolation polyuréthane 100mm sur pare-vapeur, étanchéité bicouche soudée et installation de garde-corps ODCO conformes EN 13374 pour la sécurité des futurs interventions.",
    surface: "1 800 m²",
    technique: "Isolation PU 100mm + bicouche + garde-corps ODCO",
    year: "2021",
    location: "Nevers (58)",
    display_order: 20,
    photos: [
      { file: "nievre-1-DIm4Ap7k.jpg", alt: "Immeubles Nièvre Habitat", caption: "3 immeubles de logements sociaux — 1 800 m² de toitures à rénover" },
      { file: "nievre-2-Ca6VJQKe.jpg", alt: "Dépose ancienne étanchéité", caption: "Dépose et tri sélectif de l'ancienne étanchéité — recyclage filière agréée" },
      { file: "nievre-3-DT6BWABb.jpg", alt: "Pose isolation thermique", caption: "Mise en œuvre isolation polyuréthane 100mm — résistance thermique R = 4,55 m².K/W" },
      { file: "nievre-4-DaS88ald.jpg", alt: "Garde-corps ODCO", caption: "Installation des garde-corps ODCO conformes EN 13374 — sécurité permanente" },
    ],
  },
  {
    title: "Groupe La Glacière — Auvergne Habitat",
    category: "Étanchéité Bitumineuse",
    description:
      "Pose de verre cellulaire FOAMGLAS collé au bitume à chaud — solution premium garantie 30 ans par le fabricant. Étanche à l'eau et à la vapeur, incompressible, incombustible classement A1 et insensible aux rongeurs.",
    surface: "1 200 m²",
    technique: "FOAMGLAS verre cellulaire collé bitume chaud",
    year: "2020",
    location: "Clermont-Ferrand (63)",
    display_order: 30,
    photos: [
      { file: "glaciere-1-C-F2ROeX.jpg", alt: "Groupe La Glacière", caption: "Bâtiment du Groupe La Glacière — 1 200 m² traités en verre cellulaire FOAMGLAS" },
      { file: "glaciere-2-CbEZ_nWs.jpg", alt: "Pose verre cellulaire", caption: "Pose des plaques de FOAMGLAS — étanche à l'eau ET à la vapeur (pas de pare-vapeur séparé)" },
      { file: "glaciere-3-DqUWGSdk.jpg", alt: "Bitume chaud", caption: "Collage au bitume à chaud — adhérence parfaite et durabilité 30 ans garantie fabricant" },
      { file: "glaciere-4-BkeXRwIV.jpg", alt: "Étanchéité finale", caption: "Étanchéité bicouche de finition sur FOAMGLAS — complexe incombustible classement A1" },
    ],
  },
  {
    title: "Assemblia Clermont-Ferrand",
    category: "Toiture Végétalisée",
    description:
      "Création d'une toiture-terrasse végétalisée extensive avec complexe anti-racine certifié. Mélange de sedum et graminées résistants à la sécheresse. Substrat 8cm + couche drainante + filtre géotextile sur étanchéité bitumineuse.",
    surface: "800 m²",
    technique: "Végétalisation extensive sedum + complexe anti-racine",
    year: "2023",
    location: "Clermont-Ferrand (63)",
    display_order: 40,
    photos: [
      { file: "assemblia-1-BABwhtMU.jpg", alt: "Toiture végétalisée Assemblia", caption: "Toiture végétalisée extensive Assemblia — 800 m² de sedum et graminées" },
      { file: "assemblia-2-BGNXnDeA.jpg", alt: "Complexe drainant", caption: "Mise en œuvre du complexe drainant sur membrane anti-racine certifiée FLL" },
      { file: "assemblia-3-7jvSL0Eu.jpg", alt: "Plantation sedum", caption: "Plantation du sedum en plaques pré-cultivées — couverture végétale immédiate à 95%" },
    ],
  },
  {
    title: "Université d'Auvergne — Bât. Paul Collomp",
    category: "Étanchéité Bitumineuse",
    description:
      "Réfection complète de l'étanchéité du bâtiment Paul Collomp de l'Université Clermont Auvergne. Travaux réalisés en site occupé avec contraintes acoustiques et de circulation pour ne pas perturber les enseignements.",
    surface: "800 m²",
    technique: "Réfection bicouche soudée en site occupé",
    year: "2022",
    location: "Clermont-Ferrand (63)",
    display_order: 50,
    photos: [
      { file: "universite-1-JXcXCJic.jpg", alt: "Bâtiment Paul Collomp", caption: "Bâtiment Paul Collomp — Université Clermont Auvergne, intervention en site occupé" },
      { file: "universite-2-DAuClmgA.jpg", alt: "Réfection étanchéité", caption: "Dépose des relevés bitumineux dégradés et préparation des supports béton" },
      { file: "universite-3-DaPddjy3.jpg", alt: "Étanchéité neuve", caption: "Nouvelle étanchéité bicouche soudée — finition autoprotégée minérale" },
    ],
  },
  {
    title: "Résidence Arverne — Square Habitat",
    category: "Résine",
    description:
      "Étanchéité liquide à base de résine PMMA sur 2 000 m² de balcons et coursives. Solution sans flamme appliquée à froid, idéale en site occupé. Finition par carrelage collé sur résine pour une durabilité maximale.",
    surface: "2 000 m²",
    technique: "Résine PMMA + carrelage collé",
    year: "2021",
    location: "Clermont-Ferrand (63)",
    display_order: 60,
    photos: [
      { file: "arverne-1-CWOYXzet.jpg", alt: "Balcons Résidence Arverne", caption: "Résidence Arverne — 2 000 m² de balcons et coursives à étancher" },
      { file: "arverne-2-X2XZJPAx.jpg", alt: "Application résine PMMA", caption: "Application de la résine PMMA à froid — sans flamme, sans odeur, séchage 30 min" },
      { file: "arverne-3-pkkJnr03.jpg", alt: "Pose carrelage", caption: "Pose du carrelage collé sur résine armée — durabilité 25 ans+" },
    ],
  },
  {
    title: "Terrasse Privée IPE — Lames Premium",
    category: "Terrasse IPE",
    description:
      "Aménagement d'une toiture-terrasse en lames d'IPE massif posées sur lambourdes aluminium et plots réglables PVC. Bois exotique classe 4 imputrescible, garanti 25 ans sans traitement.",
    surface: "120 m²",
    technique: "Lames IPE 21mm sur plots réglables",
    year: "2023",
    location: "Puy-de-Dôme (63)",
    display_order: 70,
    photos: [
      { file: "ipe-1-BtWaxfw_.jpg", alt: "Terrasse IPE finie", caption: "Terrasse IPE 120 m² — lames 21mm × 145mm en bois exotique classe 4" },
      { file: "ipe-2-DrtY2dfe.jpg", alt: "Plots réglables", caption: "Plots PVC réglables 40-100mm — drainage naturel et protection de l'étanchéité" },
      { file: "ipe-3-BLgwMjSO.jpg", alt: "Détail finition IPE", caption: "Finition par clips invisibles inox A4 — aucune vis apparente, esthétique haut de gamme" },
    ],
  },
  {
    title: "Toiture Sedum Murol",
    category: "Toiture Végétalisée",
    description:
      "Végétalisation extensive d'une toiture-terrasse de 400 m² en zone montagne. Mélange de sedum résistant au gel et aux variations climatiques d'altitude. Rétention d'eau pluviale > 50% du volume annuel.",
    surface: "400 m²",
    technique: "Végétalisation extensive sedum altitude",
    year: "2022",
    location: "Murol (63)",
    display_order: 80,
    photos: [
      { file: "murol-1-CiI8WH48.jpg", alt: "Toiture sedum Murol", caption: "Toiture végétalisée Murol — 400 m² adaptés à l'altitude (850m)" },
      { file: "murol-2-Dn0zJdYA.jpg", alt: "Sedum en fleurs", caption: "Sedum en fleurs été — 8 variétés sélectionnées pour résistance gel/sécheresse" },
      { file: "murol-3-BDmYLEgX.jpg", alt: "Vue d'ensemble", caption: "Rétention d'eau pluviale > 50% — gestion EP intégrée et biodiversité urbaine" },
    ],
  },
  {
    title: "École Jean Alix — Extension",
    category: "Étanchéité Bitumineuse",
    description:
      "Étanchéité de l'extension du groupe scolaire Jean Alix. Complexe complet incluant pare-vapeur, isolation laine de roche 140mm (RE 2020), étanchéité bicouche et zinguerie cuivre pour les rives et descentes EP.",
    surface: "600 m²",
    technique: "Bicouche soudée + isolation laine de roche 140mm + zinguerie cuivre",
    year: "2021",
    location: "Puy-de-Dôme (63)",
    display_order: 90,
    photos: [
      { file: "jean-alix-1-CnxZEa0t.jpg", alt: "École Jean Alix extension", caption: "Extension du groupe scolaire Jean Alix — 600 m² de toiture neuve RE 2020" },
      { file: "jean-alix-2-Mne8ComI.jpg", alt: "Pose isolation laine de roche", caption: "Isolation laine de roche 140mm — performance acoustique + thermique pour ERP" },
      { file: "jean-alix-3-BkZZ2zzM.jpg", alt: "Étanchéité bicouche", caption: "Étanchéité bicouche soudée sur isolation — protection autoprotégée" },
      { file: "jean-alix-4-KVKWEldX.jpg", alt: "Zinguerie cuivre", caption: "Façonnage et pose des rives et chéneaux en cuivre 0,6mm — durabilité 80 ans+" },
    ],
  },
  {
    title: "Romagnat — 18 Logements",
    category: "Étanchéité Bitumineuse",
    description:
      "Réhabilitation thermique de 18 logements collectifs. Mise aux normes RE 2020 par renforcement de l'isolation existante (sur-isolation 80mm) et réfection complète de l'étanchéité bitumineuse.",
    surface: "1 500 m²",
    technique: "Sur-isolation PU 80mm + bicouche + garde-corps",
    year: "2020",
    location: "Romagnat (63)",
    display_order: 100,
    photos: [
      { file: "romagnat-1-ocnYrBFj.jpg", alt: "Immeuble Romagnat", caption: "Résidence Romagnat — réhabilitation 18 logements collectifs (1 500 m²)" },
      { file: "romagnat-2-Fh2ASBTj.jpg", alt: "Sur-isolation", caption: "Sur-isolation polyuréthane 80mm sur isolant existant conservé — économie circulaire" },
      { file: "romagnat-3-B0VGoxxj.jpg", alt: "Étanchéité finale", caption: "Étanchéité bicouche + relevés conformes DTU 43.1 — éligible MaPrimeRénov Copro" },
    ],
  },
  {
    title: "Centre Multi-Accueil Vic-le-Comte",
    category: "Étanchéité Bitumineuse",
    description:
      "Étanchéité neuve d'un centre multi-accueil petite enfance. Cahier des charges renforcé pour un bâtiment recevant des enfants : isolation acoustique, sécurité incendie A1 et matériaux à faibles émissions COV.",
    surface: "350 m²",
    technique: "Étanchéité neuf bicouche + isolation laine de roche A1",
    year: "2022",
    location: "Vic-le-Comte (63)",
    display_order: 110,
    photos: [
      { file: "vic-1-BTHX2Zrn.jpg", alt: "Centre multi-accueil", caption: "Centre Multi-Accueil Vic-le-Comte — 350 m² pour bâtiment petite enfance" },
      { file: "vic-2-D-3UDOvh.jpg", alt: "Isolation A1", caption: "Isolation laine de roche classement A1 — sécurité incendie maximale ERP" },
      { file: "vic-3-D-_YR2p_.jpg", alt: "Finition", caption: "Finition autoprotégée — matériaux faibles émissions COV (label A+)" },
    ],
  },
  {
    title: "16 Logements Le Cendre — Accession Sociale",
    category: "Étanchéité Bitumineuse",
    description:
      "Étanchéité neuve de 16 logements en accession sociale à la propriété. Construction conforme RE 2020 avec isolation thermique haute performance et étanchéité bicouche garantie décennale.",
    surface: "900 m²",
    technique: "Bicouche neuf + isolation PU 120mm RE 2020",
    year: "2021",
    location: "Le Cendre (63)",
    display_order: 120,
    photos: [
      { file: "cendre-1-CFFIgcAv.jpg", alt: "16 logements Le Cendre", caption: "Programme 16 logements Le Cendre — accession sociale à la propriété" },
      { file: "cendre-2-DCkp-ChH.jpg", alt: "Isolation PU 120mm", caption: "Isolation polyuréthane 120mm — conformité RE 2020 (Up = 0,18 W/m².K)" },
      { file: "cendre-3-4sQMngBB.jpg", alt: "Étanchéité bicouche", caption: "Étanchéité bicouche soudée — garantie décennale + DO" },
    ],
  },
];

async function seed() {
  console.log(`Connecting to ${SUPABASE_URL}`);
  console.log(`Signing in as ${EDITOR_EMAIL}…`);

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: EDITOR_EMAIL,
    password: EDITOR_PASSWORD,
  });

  if (authErr || !authData?.session) {
    console.error(`✗ sign-in failed: ${authErr?.message || "no session returned"}`);
    process.exit(1);
  }
  console.log(`✓ signed in (user ${authData.user?.id})\n`);

  let inserted = 0;
  let skipped = 0;
  let photosInserted = 0;

  for (const r of REALISATIONS) {
    const { data: existing, error: lookupErr } = await supabase
      .from("realisations")
      .select("id,title")
      .eq("title", r.title)
      .limit(1);

    if (lookupErr) {
      console.error(`✗ lookup failed for "${r.title}":`, lookupErr.message);
      continue;
    }

    if (existing && existing.length > 0) {
      console.log(`• skip "${r.title}" — already exists (${existing[0].id})`);
      skipped++;
      continue;
    }

    const { data: realRow, error: insertErr } = await supabase
      .from("realisations")
      .insert({
        title: r.title,
        category: r.category,
        description: r.description,
        surface: r.surface,
        technique: r.technique,
        year: r.year,
        location: r.location,
        display_order: r.display_order,
        status: "published",
      })
      .select("id")
      .single();

    if (insertErr || !realRow) {
      console.error(`✗ insert realisation failed for "${r.title}":`, insertErr?.message);
      continue;
    }

    const photoRows = r.photos.map((p, idx) => ({
      realisation_id: realRow.id,
      url: ASSET(p.file),
      alt_text: p.alt,
      caption: p.caption,
      display_order: idx * 10,
      is_favorite: idx === 0,
    }));

    const { error: photoErr, count } = await supabase
      .from("realisation_photos")
      .insert(photoRows, { count: "exact" });

    if (photoErr) {
      console.error(`✗ insert photos failed for "${r.title}":`, photoErr.message);
      continue;
    }

    inserted++;
    photosInserted += count ?? photoRows.length;
    console.log(`✓ inserted "${r.title}" (${realRow.id}) — ${photoRows.length} photos`);
  }

  console.log(
    `\nDone. ${inserted} realisations inserted, ${skipped} skipped, ${photosInserted} photos inserted.`
  );
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
