import type { BreadcrumbCrumb } from "@/components/SEO";

export const SITE_URL = "https://www.etanche.com";

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "RoofingContractor",
  name: "EQUATION",
  description: "Expert en étanchéité de toitures terrasses depuis 2001",
  url: SITE_URL,
  telephone: "+33473875350",
  email: "info@etanche.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "74 avenue du Midi",
    addressLocality: "Cournon-d'Auvergne",
    postalCode: "63800",
    addressRegion: "Auvergne-Rhône-Alpes",
    addressCountry: "FR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 45.7333,
    longitude: 3.1833,
  },
  foundingDate: "2001",
  areaServed: ["Puy-de-Dôme", "Allier", "Haute-Loire", "Cantal", "Nièvre"],
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Qualibat RGE",
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Garantie Décennale",
    },
  ],
  sameAs: ["https://www.linkedin.com/in/thierry-meylan-39799111b/"],
};

interface PageSEO {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbCrumb[];
}

export const PAGE_SEO: Record<string, PageSEO> = {
  home: {
    title:
      "EQUATION — Expert Étanchéité & Isolation Toiture Terrasse à Clermont-Ferrand (63) | Depuis 2001",
    description:
      "Entreprise spécialisée en étanchéité de toitures terrasses à Cournon-d'Auvergne. Qualibat RGE, garantie décennale. Bitume, résine, végétalisation, dalles sur plots, bois IPE. Devis gratuit.",
    breadcrumbs: [],
  },
  entreprise: {
    title: "EQUATION — 25 Ans d'Expertise en Étanchéité | Qualibat RGE",
    description:
      "Découvrez EQUATION, entreprise familiale d'étanchéité fondée en 2001 à Cournon-d'Auvergne. 25 ans d'expertise, certifications Qualibat RGE, garantie décennale.",
    breadcrumbs: [{ name: "Entreprise", path: "/entreprise" }],
  },
  coeurMetier: {
    title:
      "Nos Métiers — Étanchéité, Isolation, Végétalisation | EQUATION 63",
    description:
      "Étanchéité bitume et résine, isolation thermique, toitures végétalisées, dalles sur plots, bois IPE. Tous corps d'état d'étanchéité de toiture terrasse en Auvergne.",
    breadcrumbs: [{ name: "Cœur de métier", path: "/coeur-de-metier" }],
  },
  solutionsInnovantes: {
    title:
      "Solutions Innovantes — FOAMGLAS, Cool Roof, Photovoltaïque | EQUATION",
    description:
      "Isolation FOAMGLAS, revêtements Cool Roof, intégration photovoltaïque, toitures végétalisées : EQUATION déploie les solutions d'étanchéité innovantes en Auvergne.",
    breadcrumbs: [
      { name: "Solutions innovantes", path: "/solutions-innovantes" },
    ],
  },
  realisations: {
    title: "Nos Réalisations en Étanchéité et Isolation | EQUATION",
    description:
      "Découvrez nos chantiers de référence : CPAM, Assemblia, Glacière, Conseil Départemental de la Nièvre. Étanchéité, isolation et végétalisation de toitures terrasses.",
    breadcrumbs: [{ name: "Réalisations", path: "/realisations" }],
  },
  blog: {
    title: "Blog Étanchéité — Conseils et Guides | EQUATION",
    description:
      "Guides, conseils et actualités sur l'étanchéité de toitures terrasses, l'isolation, la végétalisation et les solutions innovantes du bâtiment par EQUATION.",
    breadcrumbs: [{ name: "Blog", path: "/blog" }],
  },
  avisClients: {
    title: "Avis Clients EQUATION — Témoignages | Étanchéité 63",
    description:
      "Lisez les témoignages de nos clients sur EQUATION, entreprise d'étanchéité à Cournon-d'Auvergne. Maîtres d'ouvrage publics, architectes et particuliers nous recommandent.",
    breadcrumbs: [{ name: "Avis clients", path: "/avis-clients" }],
  },
  aPropos: {
    title: "À Propos — EQUATION, Étanchéité & Isolation en Auvergne",
    description:
      "Nos valeurs, notre équipe, notre histoire : depuis 2001, EQUATION place l'efficacité et la qualité au cœur de chaque chantier d'étanchéité.",
    breadcrumbs: [{ name: "À propos", path: "/a-propos" }],
  },
  contact: {
    title:
      "Contact & Devis Gratuit — EQUATION Étanchéité Clermont-Ferrand",
    description:
      "Contactez EQUATION pour un devis gratuit en étanchéité, isolation ou végétalisation de toiture terrasse. 74 avenue du Midi, 63800 Cournon-d'Auvergne. Tél. +33 4 73 87 53 50.",
    breadcrumbs: [{ name: "Contact", path: "/contact" }],
  },
  recrutement: {
    title: "Recrutement — Rejoignez EQUATION | Étanchéité 63",
    description:
      "Rejoignez EQUATION : nous recrutons étancheurs, chefs d'équipe et conducteurs de travaux dans le Puy-de-Dôme. Postes en CDI, ambiance familiale, formation continue.",
    breadcrumbs: [{ name: "Recrutement", path: "/recrutement" }],
  },
  mentionsLegales: {
    title: "Mentions Légales — EQUATION Étanchéité",
    description:
      "Mentions légales du site EQUATION : éditeur, hébergeur, données personnelles, propriété intellectuelle.",
    breadcrumbs: [{ name: "Mentions légales", path: "/mentions-legales" }],
  },
};
