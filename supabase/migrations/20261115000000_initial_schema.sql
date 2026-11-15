-- ==============================================================================
-- VidyaPath AI - Production Schema Migration
-- Version: 1.0.0
-- Created: 2026-11-15
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'te', 'hi')),
  state TEXT,
  education_level TEXT,
  course TEXT,
  annual_family_income NUMERIC(12, 2) DEFAULT 0,
  category TEXT,
  gender TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  consent_preferences JSONB DEFAULT '{"marketing": false, "application_reminders": true, "deadline_alerts": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on profiles email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.scholarships (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL, -- Multilingual {en, te, hi}
  provider JSONB NOT NULL, -- Multilingual {en, te, hi}
  scheme_type VARCHAR(20) NOT NULL CHECK (scheme_type IN ('central', 'state', 'private')),
  description JSONB NOT NULL,
  benefits JSONB NOT NULL,
  award_amount NUMERIC(12, 2),
  education_levels TEXT[] NOT NULL DEFAULT '{}',
  eligible_states TEXT[] NOT NULL DEFAULT '{}',
  income_limit NUMERIC(12, 2),
  applicable_categories TEXT[] DEFAULT '{}',
  applicable_genders TEXT[] DEFAULT '{}',
  eligibility_conditions JSONB DEFAULT '[]'::jsonb,
  required_documents JSONB DEFAULT '[]'::jsonb,
  application_instructions JSONB DEFAULT '{}'::jsonb,
  opening_date DATE,
  closing_date DATE,
  is_deadline_tentative BOOLEAN DEFAULT FALSE,
  official_url TEXT NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'pending', 'unverified')),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarships_slug ON public.scholarships(slug);
CREATE INDEX IF NOT EXISTS idx_scholarships_scheme_type ON public.scholarships(scheme_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_verification ON public.scholarships(verification_status);
CREATE INDEX IF NOT EXISTS idx_scholarships_closing_date ON public.scholarships(closing_date);

-- 3. SCHOLARSHIP SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.scholarship_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scholarship_id TEXT NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('official_portal', 'ministry_gazette', 'foundation_announcement')),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_scholarship_id ON public.scholarship_sources(scholarship_id);

-- 4. SAVED SCHOLARSHIPS (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scholarship_id TEXT NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_saved_scholarship UNIQUE (user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_scholarships_user ON public.saved_scholarships(user_id);

-- 5. APPLICATION TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scholarship_id TEXT NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  stage VARCHAR(30) NOT NULL DEFAULT 'interested' CHECK (
    stage IN ('interested', 'preparing_documents', 'ready_to_apply', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')
  ),
  notes TEXT DEFAULT '',
  application_number TEXT,
  submission_date DATE,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_scholarship_app UNIQUE (user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);

-- 6. APPLICATION CHECKLIST ITEMS
CREATE TABLE IF NOT EXISTS public.application_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT TRUE,
  is_ready BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_application ON public.application_checklist_items(application_id);

-- 7. NOTIFICATIONS & PREFERENCES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'system_alert',
  is_read BOOLEAN DEFAULT FALSE,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- 8. AI ASSISTANT CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.assistant_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Nullable for guests
  title TEXT NOT NULL DEFAULT 'Scholarship Query',
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
  role VARCHAR(15) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  citations JSONB DEFAULT '[]'::jsonb,
  feedback VARCHAR(10) CHECK (feedback IN ('helpful', 'unhelpful')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.assistant_messages(conversation_id);

-- 9. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if caller is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Scholarships Policies (Public read for verified or all, admin write)
CREATE POLICY "Public can view scholarships"
  ON public.scholarships FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert scholarships"
  ON public.scholarships FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update scholarships"
  ON public.scholarships FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete scholarships"
  ON public.scholarships FOR DELETE
  USING (public.is_admin());

-- Sources Policies
CREATE POLICY "Public can view sources"
  ON public.scholarship_sources FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage sources"
  ON public.scholarship_sources FOR ALL
  USING (public.is_admin());

-- Saved Scholarships Policies
CREATE POLICY "Users can view own saved scholarships"
  ON public.saved_scholarships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved scholarships"
  ON public.saved_scholarships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved scholarships"
  ON public.saved_scholarships FOR DELETE
  USING (auth.uid() = user_id);

-- Applications Policies
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

-- Checklist Policies
CREATE POLICY "Users can view own checklist items"
  ON public.application_checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Users can modify own checklist items"
  ON public.application_checklist_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id AND a.user_id = auth.uid()
  ));

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Assistant Policies
CREATE POLICY "Users can view own conversations"
  ON public.assistant_conversations FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own messages"
  ON public.assistant_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.assistant_conversations c
    WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  ));

-- Admin Audit Logs
CREATE POLICY "Only admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin());
