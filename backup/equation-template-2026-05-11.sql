-- ============================================================================
-- EQUATION — Schéma de référence Supabase (template réutilisable)
-- Généré : 2026-05-11
-- Exécutable tel quel sur un projet Supabase vide.
-- Ne contient AUCUNE donnée, AUCUN ID spécifique.
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS POSTGRESQL
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
-- supabase_vault est fourni par la plateforme, à activer si besoin :
-- CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- ============================================================================
-- 2. ENUMS / TYPES PERSONNALISÉS
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'admin',
    'editor',
    'user',
    'blog_editor',
    'realisations_editor',
    'sections_editor',
    'recrutement_editor',
    'commercial'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 3. TABLES (schéma public)
-- ============================================================================

-- ---- profiles ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---- user_roles -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ---- audit_log --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action          text NOT NULL,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---- frontend_error_logs ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.frontend_error_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid,
  error_message  text,
  error_stack    text,
  url            text,
  user_agent     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ---- vercel_deploy_log ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vercel_deploy_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table   text NOT NULL,
  source_action  text NOT NULL,
  triggered_at   timestamptz NOT NULL DEFAULT now()
);

-- ---- blog_articles ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_articles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  slug              text NOT NULL UNIQUE,
  category          text NOT NULL,
  excerpt           text,
  content           text NOT NULL DEFAULT '',
  cover_image_url   text,
  video_url         text,
  meta_title        text,
  meta_description  text,
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at      timestamptz,
  author_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ---- realisations -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.realisations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  slug           text NOT NULL,
  category       text NOT NULL,
  description    text,
  surface        text,
  technique      text,
  year           text,
  location       text,
  video_url      text,
  display_order  integer NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ---- realisation_photos -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.realisation_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  realisation_id  uuid NOT NULL REFERENCES public.realisations(id) ON DELETE CASCADE,
  url             text NOT NULL,
  caption         text,
  alt_text        text,
  is_favorite     boolean NOT NULL DEFAULT false,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---- site_sections ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_sections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page            text NOT NULL CHECK (page IN ('coeur-metier','solutions-innovantes')),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  intro           text,
  points          text[] DEFAULT '{}',
  reference_text  text,
  video_url       text,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---- section_photos ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.section_photos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id     uuid NOT NULL REFERENCES public.site_sections(id) ON DELETE CASCADE,
  url            text NOT NULL,
  caption        text,
  alt_text       text,
  is_favorite    boolean NOT NULL DEFAULT false,
  display_order  integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ---- job_offers -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_offers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  contract_type  text NOT NULL DEFAULT 'CDI',
  location       text NOT NULL DEFAULT '',
  description    text NOT NULL DEFAULT '',
  display_order  integer NOT NULL DEFAULT 0,
  is_published   boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ---- job_applications -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  position        text,
  message         text NOT NULL,
  cv_url          text,
  cv_filename     text,
  cv_size_bytes   integer,
  status          text NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','in_review','interview','rejected','hired','archived')),
  admin_notes     text,
  reviewed_at     timestamptz,
  reviewed_by     uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---- client_users -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  uuid UNIQUE,
  email         text NOT NULL UNIQUE,
  full_name     text NOT NULL,
  company       text,
  role          text NOT NULL DEFAULT 'client' CHECK (role IN ('client','employee')),
  is_active     boolean NOT NULL DEFAULT true,
  expires_at    timestamptz,
  created_by    uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ---- client_documents -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_documents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id   uuid NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text,
  file_url         text NOT NULL,
  storage_path     text NOT NULL,
  file_type        text NOT NULL CHECK (file_type IN ('pdf','image','video','other')),
  file_size_bytes  bigint,
  uploaded_by      uuid,
  uploaded_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at        ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target            ON public.audit_log (target_user_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug          ON public.blog_articles (slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_status        ON public.blog_articles (status);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_user_id
                                                          ON public.client_documents (client_user_id);
CREATE INDEX IF NOT EXISTS idx_client_users_auth_user_id   ON public.client_users (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_frontend_error_logs_created_at
                                                          ON public.frontend_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status     ON public.job_applications (status);
CREATE INDEX IF NOT EXISTS idx_realisation_photos_order    ON public.realisation_photos (display_order);
CREATE INDEX IF NOT EXISTS idx_realisation_photos_realisation
                                                          ON public.realisation_photos (realisation_id);
CREATE INDEX IF NOT EXISTS idx_realisations_order          ON public.realisations (display_order);
CREATE INDEX IF NOT EXISTS idx_realisations_status         ON public.realisations (status);
CREATE UNIQUE INDEX IF NOT EXISTS realisations_slug_unique_idx
                                                          ON public.realisations (slug);
CREATE INDEX IF NOT EXISTS idx_section_photos_section      ON public.section_photos (section_id);
CREATE INDEX IF NOT EXISTS idx_vercel_deploy_log_triggered_at
                                                          ON public.vercel_deploy_log (triggered_at DESC);

-- ============================================================================
-- 5. FONCTIONS PL/pgSQL ET TRIGGERS
-- ============================================================================

-- ---- set_updated_at ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---- has_role / has_role_text / is_admin_or_editor / is_role_or_admin -------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_role_or_admin(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_or_editor(_user_id)
      OR public.has_role_text(_user_id, _role);
$$;

-- ---- current_client_user_id -------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_client_user_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.client_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ---- handle_new_user (création profile à l'inscription) ---------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- ---- bootstrap_first_admin (premier user OU info@etanche.com -> admin) ------
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'info@etanche.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSIF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- ---- enforce_single_favorite (realisation_photos) ---------------------------
CREATE OR REPLACE FUNCTION public.enforce_single_favorite()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_favorite = true THEN
    UPDATE public.realisation_photos
       SET is_favorite = false
     WHERE realisation_id = NEW.realisation_id
       AND id <> NEW.id
       AND is_favorite = true;
  END IF;
  RETURN NEW;
END;
$$;

-- ---- enforce_single_section_favorite (section_photos) -----------------------
CREATE OR REPLACE FUNCTION public.enforce_single_section_favorite()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_favorite = true THEN
    UPDATE public.section_photos
       SET is_favorite = false
     WHERE section_id = NEW.section_id
       AND id <> NEW.id
       AND is_favorite = true;
  END IF;
  RETURN NEW;
END;
$$;

-- ---- trigger_vercel_rebuild + notify_content_change -------------------------
-- NOTE : adapter l'URL `edge_url` ci-dessous au nouveau projet Supabase.
CREATE OR REPLACE FUNCTION public.trigger_vercel_rebuild(source_table text, source_action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  last_trigger timestamptz;
  edge_url text := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/trigger-vercel-rebuild';
BEGIN
  SELECT MAX(triggered_at) INTO last_trigger FROM public.vercel_deploy_log;
  IF last_trigger IS NOT NULL AND last_trigger > (now() - interval '60 seconds') THEN
    RAISE NOTICE 'Rebuild skipped (debounce): last trigger at %', last_trigger;
    RETURN;
  END IF;
  INSERT INTO public.vercel_deploy_log (source_table, source_action)
  VALUES (source_table, source_action);
  PERFORM net.http_post(
    url := edge_url,
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('source_table', source_table, 'source_action', source_action)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_content_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.trigger_vercel_rebuild(TG_TABLE_NAME, TG_OP);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- ---- TRIGGERS sur auth.users ------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created          ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_bootstrap_admin  ON auth.users;
CREATE TRIGGER on_auth_user_bootstrap_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- ---- TRIGGERS updated_at ----------------------------------------------------
DROP TRIGGER IF EXISTS trg_profiles_updated         ON public.profiles;
CREATE TRIGGER trg_profiles_updated         BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_articles_updated         ON public.blog_articles;
CREATE TRIGGER trg_articles_updated         BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_realisations_updated     ON public.realisations;
CREATE TRIGGER trg_realisations_updated     BEFORE UPDATE ON public.realisations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS site_sections_updated_at     ON public.site_sections;
CREATE TRIGGER site_sections_updated_at     BEFORE UPDATE ON public.site_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_job_offers_updated_at    ON public.job_offers;
CREATE TRIGGER trg_job_offers_updated_at    BEFORE UPDATE ON public.job_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_client_users_updated_at  ON public.client_users;
CREATE TRIGGER set_client_users_updated_at  BEFORE UPDATE ON public.client_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---- TRIGGERS favoris uniques -----------------------------------------------
DROP TRIGGER IF EXISTS trg_single_favorite ON public.realisation_photos;
CREATE TRIGGER trg_single_favorite
  AFTER INSERT OR UPDATE OF is_favorite ON public.realisation_photos
  FOR EACH ROW WHEN (NEW.is_favorite = true)
  EXECUTE FUNCTION public.enforce_single_favorite();

DROP TRIGGER IF EXISTS section_photos_single_favorite ON public.section_photos;
CREATE TRIGGER section_photos_single_favorite
  BEFORE INSERT OR UPDATE OF is_favorite ON public.section_photos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_section_favorite();

-- ---- TRIGGERS rebuild Vercel ------------------------------------------------
DROP TRIGGER IF EXISTS trg_blog_articles_rebuild     ON public.blog_articles;
CREATE TRIGGER trg_blog_articles_rebuild
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.notify_content_change();

DROP TRIGGER IF EXISTS trg_realisations_rebuild      ON public.realisations;
CREATE TRIGGER trg_realisations_rebuild
  AFTER INSERT OR UPDATE OR DELETE ON public.realisations
  FOR EACH ROW EXECUTE FUNCTION public.notify_content_change();

DROP TRIGGER IF EXISTS trg_realisation_photos_rebuild ON public.realisation_photos;
CREATE TRIGGER trg_realisation_photos_rebuild
  AFTER INSERT OR UPDATE OR DELETE ON public.realisation_photos
  FOR EACH ROW EXECUTE FUNCTION public.notify_content_change();

DROP TRIGGER IF EXISTS trg_site_sections_rebuild     ON public.site_sections;
CREATE TRIGGER trg_site_sections_rebuild
  AFTER INSERT OR UPDATE OR DELETE ON public.site_sections
  FOR EACH ROW EXECUTE FUNCTION public.notify_content_change();

DROP TRIGGER IF EXISTS trg_section_photos_rebuild    ON public.section_photos;
CREATE TRIGGER trg_section_photos_rebuild
  AFTER INSERT OR UPDATE OR DELETE ON public.section_photos
  FOR EACH ROW EXECUTE FUNCTION public.notify_content_change();

DROP TRIGGER IF EXISTS trg_job_offers_rebuild        ON public.job_offers;
CREATE TRIGGER trg_job_offers_rebuild
  AFTER INSERT OR UPDATE OR DELETE ON public.job_offers
  FOR EACH ROW EXECUTE FUNCTION public.notify_content_change();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) + POLICIES
-- ============================================================================

-- ---- profiles ---------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ---- user_roles -------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL  TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ---- audit_log --------------------------------------------------------------
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---- frontend_error_logs ----------------------------------------------------
ALTER TABLE public.frontend_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log frontend errors"
  ON public.frontend_error_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view frontend error logs"
  ON public.frontend_error_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---- vercel_deploy_log (pas de policy publique, accessible service_role) ----
ALTER TABLE public.vercel_deploy_log ENABLE ROW LEVEL SECURITY;

-- ---- blog_articles ----------------------------------------------------------
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published articles"
  ON public.blog_articles FOR SELECT TO public USING (status = 'published');
CREATE POLICY "Blog editors can view all articles"
  ON public.blog_articles FOR SELECT TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'blog_editor'));
CREATE POLICY "Blog editors can insert articles"
  ON public.blog_articles FOR INSERT TO authenticated
  WITH CHECK (public.is_role_or_admin(auth.uid(),'blog_editor'));
CREATE POLICY "Blog editors can update articles"
  ON public.blog_articles FOR UPDATE TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'blog_editor'));
CREATE POLICY "Admins can delete articles"
  ON public.blog_articles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---- realisations -----------------------------------------------------------
ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published realisations"
  ON public.realisations FOR SELECT TO public USING (status = 'published');
CREATE POLICY "Realisations editors can view all"
  ON public.realisations FOR SELECT TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'realisations_editor'));
CREATE POLICY "Realisations editors can insert"
  ON public.realisations FOR INSERT TO authenticated
  WITH CHECK (public.is_role_or_admin(auth.uid(),'realisations_editor'));
CREATE POLICY "Realisations editors can update"
  ON public.realisations FOR UPDATE TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'realisations_editor'));
CREATE POLICY "Admins can delete realisations"
  ON public.realisations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---- realisation_photos -----------------------------------------------------
ALTER TABLE public.realisation_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view photos of published realisations"
  ON public.realisation_photos FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM public.realisations r
                 WHERE r.id = realisation_photos.realisation_id AND r.status = 'published'));
CREATE POLICY "Realisations editors manage photos"
  ON public.realisation_photos FOR ALL TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'realisations_editor'))
  WITH CHECK (public.is_role_or_admin(auth.uid(),'realisations_editor'));

-- ---- site_sections ----------------------------------------------------------
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sections"
  ON public.site_sections FOR SELECT TO public USING (true);
CREATE POLICY "Sections editors can insert"
  ON public.site_sections FOR INSERT TO authenticated
  WITH CHECK (public.is_role_or_admin(auth.uid(),'sections_editor'));
CREATE POLICY "Sections editors can update"
  ON public.site_sections FOR UPDATE TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'sections_editor'));
CREATE POLICY "Admins can delete sections"
  ON public.site_sections FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---- section_photos ---------------------------------------------------------
ALTER TABLE public.section_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view section photos"
  ON public.section_photos FOR SELECT TO public USING (true);
CREATE POLICY "Sections editors manage section photos"
  ON public.section_photos FOR ALL TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'sections_editor'))
  WITH CHECK (public.is_role_or_admin(auth.uid(),'sections_editor'));

-- ---- job_offers -------------------------------------------------------------
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published job offers"
  ON public.job_offers FOR SELECT TO public USING (is_published = true);
CREATE POLICY "Recrutement editors can view all"
  ON public.job_offers FOR SELECT TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'recrutement_editor'));
CREATE POLICY "Recrutement editors can insert"
  ON public.job_offers FOR INSERT TO authenticated
  WITH CHECK (public.is_role_or_admin(auth.uid(),'recrutement_editor'));
CREATE POLICY "Recrutement editors can update"
  ON public.job_offers FOR UPDATE TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'recrutement_editor'));
CREATE POLICY "Admins can delete job offers"
  ON public.job_offers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---- job_applications -------------------------------------------------------
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit application"
  ON public.job_applications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Recrutement can view applications"
  ON public.job_applications FOR SELECT TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'recrutement_editor'));
CREATE POLICY "Recrutement can update applications"
  ON public.job_applications FOR UPDATE TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'recrutement_editor'));
CREATE POLICY "Recrutement can delete applications"
  ON public.job_applications FOR DELETE TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'recrutement_editor'));

-- ---- client_users -----------------------------------------------------------
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own row"
  ON public.client_users FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "Editors and commercial can view client_users"
  ON public.client_users FOR SELECT TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'commercial'));
CREATE POLICY "Editors can insert client_users"
  ON public.client_users FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can update client_users"
  ON public.client_users FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete client_users"
  ON public.client_users FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---- client_documents -------------------------------------------------------
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own documents"
  ON public.client_documents FOR SELECT TO authenticated
  USING (client_user_id = public.current_client_user_id());
CREATE POLICY "Editors and commercial can view client_documents"
  ON public.client_documents FOR SELECT TO authenticated
  USING (public.is_role_or_admin(auth.uid(),'commercial'));
CREATE POLICY "Editors can insert client_documents"
  ON public.client_documents FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can update client_documents"
  ON public.client_documents FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can delete client_documents"
  ON public.client_documents FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- ============================================================================
-- 7. STORAGE BUCKETS + POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media','media', true, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('client-documents','client-documents', false, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-candidats','cv-candidats', false, 5242880,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket "media" (public)
CREATE POLICY "Public can read media objects"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'media');
CREATE POLICY "Editors can upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can update media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can delete media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()));

-- Bucket "client-documents" (privé, dossier = client_user_id)
CREATE POLICY "Clients can read own folder client-documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = (public.current_client_user_id())::text
  );
CREATE POLICY "Editors can read client-documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'client-documents' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can upload client-documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-documents' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can update client-documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'client-documents' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Editors can delete client-documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'client-documents' AND public.is_admin_or_editor(auth.uid()));

-- Bucket "cv-candidats" (privé, dépôt public, lecture/suppression recrutement)
CREATE POLICY "Public can upload CV"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'cv-candidats');
CREATE POLICY "Recrutement can view CVs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cv-candidats' AND public.is_role_or_admin(auth.uid(),'recrutement_editor'));
CREATE POLICY "Recrutement can delete CVs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cv-candidats' AND public.is_role_or_admin(auth.uid(),'recrutement_editor'));

-- ============================================================================
-- 8. EDGE FUNCTIONS
--    Code TypeScript complet : voir /backup/edge-functions/<nom>/index.ts
-- ============================================================================
-- - admin-create-client            : création client (auth user + ligne client_users)
-- - admin-delete-client            : suppression client (auth + storage + ligne)
-- - admin-generate-temp-password   : génération mot de passe temporaire
-- - admin-invite-user              : invitation utilisateur interne avec rôle
-- - admin-reset-user-password      : envoi lien reset (admin)
-- - admin-send-reset-email         : envoi mail reset via flow standard
-- - notify-new-application         : envoi mail Resend pour candidatures
-- - send-contact-request           : envoi mail Resend pour demandes de devis
-- - trigger-vercel-rebuild         : déclenchement deploy hook Vercel

-- ============================================================================
-- 9. SECRETS / VARIABLES D'ENVIRONNEMENT (à configurer dans le nouveau projet)
-- ============================================================================
-- SUPABASE_URL                : URL de l'API Supabase (auto)
-- SUPABASE_ANON_KEY           : clé publique anon (auto)
-- SUPABASE_PUBLISHABLE_KEY    : alias éventuel de la clé publique
-- SUPABASE_SERVICE_ROLE_KEY   : clé service_role pour ops admin (auto)
-- SUPABASE_DB_URL             : URL de connexion Postgres directe (auto)
-- SUPABASE_JWKS               : JWKS pour validation JWT (auto)
-- RESEND_API_KEY              : clé API Resend pour envoi emails transactionnels
-- VERCEL_DEPLOY_HOOK_URL      : URL du Deploy Hook Vercel pour rebuild auto
-- LOVABLE_API_KEY             : clé Lovable AI Gateway (si IA utilisée)

-- ============================================================================
-- FIN
-- ============================================================================
