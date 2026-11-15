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

-- Automated Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    preferred_language
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'en'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Users and guests can insert conversations"
  ON public.assistant_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users and guests can insert messages"
  ON public.assistant_messages FOR INSERT
  WITH CHECK (EXISTS (
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



-- ==============================================================================
-- 10. SEED DATA: 8 VERIFIED INDIAN SCHOLARSHIP SCHEMES
-- ==============================================================================
INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'sc-post-matric-nsp',
  'post-matric-scholarship-sc-students',
  '{"en":"Post-Matric Scholarship Scheme for SC Students","te":"ఎస్సీ విద్యార్థుల కోసం పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ పథకం","hi":"अनुसूचित जाति (SC) छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति योजना"}'::jsonb,
  '{"en":"Ministry of Social Justice and Empowerment, Government of India","te":"సామాజిక న్యాయం మరియు సాధికారత మంత్రిత్వ శాఖ, భారత ప్రభుత్వం","hi":"सामाजिक न्याय और अधिकारिता मंत्रालय, भारत सरकार"}'::jsonb,
  'central',
  '{"en":"A Centrally Sponsored Scheme providing financial assistance to Scheduled Caste students studying at post-matriculation or post-secondary stage to enable them to complete their education.","te":"షెడ్యూల్డ్ కులాల విద్యార్థులు ఉన్నత విద్యను పూర్తి చేయడానికి పోస్ట్-మెట్రిక్ లేదా పోస్ట్-సెకండరీ స్థాయిలో ఆర్థిక సహాయం అందించే కేంద్ర ప్రాయోజిత పథకం.","hi":"अनुसूचित जाति के छात्रों को उच्च शिक्षा पूर्ण करने में सक्षम बनाने हेतु पोस्ट-मैट्रिक अथवा पोस्ट-सेकेंडरी स्तर पर वित्तीय सहायता प्रदान करने वाली केंद्र प्रायोजित योजना।"}'::jsonb,
  '{"en":"Full compulsory non-refundable fees (tuition, library, exam fees) plus monthly maintenance allowance ranging from ₹2,500 to ₹13,500 per annum depending on course group.","te":"సంపూర్ణ ట్యూషన్ ఫీజు రీయింబర్స్‌మెంట్ మరియు కోర్సును బట్టి సంవత్సరానికి ₹2,500 నుండి ₹13,500 వరకు నెలవారీ నిర్వహణ భత్యం.","hi":"अनिवार्य गैर-वापसी योग्य शिक्षण शुल्क प्रतिपूर्ति एवं पाठ्यक्रम समूह के आधार पर ₹2,500 से ₹13,500 प्रति वर्ष का रखरखाव भत्ता।"}'::jsonb,
  13500,
  '{"class_11_12","diploma","undergraduate","postgraduate","phd"}'::text[],
  '{"All India"}'::text[],
  250000,
  '{"SC"}'::text[],
  '{"all"}'::text[],
  '[{"id":"cat-sc","field":"category","operator":"equals","value":"SC","description":{"en":"Student must belong to the Scheduled Caste (SC) category.","te":"విద్యార్థి తప్పనిసరిగా షెడ్యూల్డ్ కులాల (SC) వర్గానికి చెందినవారై ఉండాలి.","hi":"छात्र अनिवार्य रूप से अनुसूचित जाति (SC) वर्ग से संबंधित होना चाहिए।"},"is_mandatory":true},{"id":"income-250k","field":"income","operator":"lte","value":250000,"description":{"en":"Total annual family income from all sources must not exceed ₹2,50,000 per annum.","te":"అన్ని మార్గాల నుండి మొత్తం వార్షిక కుటుంబ ఆదాయం ₹2,50,000 మించకూడదు.","hi":"सभी स्रोतों से कुल वार्षिक पारिवारिक आय ₹2,50,000 से अधिक नहीं होनी चाहिए।"},"is_mandatory":true},{"id":"level-post-matric","field":"education_level","operator":"in","value":["class_11_12","diploma","undergraduate","postgraduate","phd"],"description":{"en":"Enrolled in a recognized post-matriculation institution or university.","te":"గుర్తింపు పొందిన పోస్ట్-మెట్రిక్ విద్యాసంస్థ లేదా విశ్వవిద్యాలయంలో ప్రవేశం పొంది ఉండాలి.","hi":"मान्यता प्राप्त पोस्ट-मैट्रिक संस्थान या विश्वविद्यालय में नामांकित होना चाहिए।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"caste-cert","name":{"en":"Caste / Community Certificate (SC)","te":"కుల ధృవీకరణ పత్రం (SC సర్టిఫికెట్)","hi":"जाति प्रमाण पत्र (SC)"},"is_mandatory":true,"description":{"en":"Issued by competent revenue authority (Tahsildar / Sub-Divisional Magistrate).","te":"తహశీల్దార్ లేదా సబ్-డివిజనల్ మేజిస్ట్రేట్ జారీ చేసిన అధికారిక పత్రం.","hi":"सक्षम राजस्व प्राधिकारी (तहसीलदार / एसडीएम) द्वारा जारी।"}},{"id":"income-cert","name":{"en":"Income Certificate (Valid for Current Financial Year)","te":"ఆదాయ ధృవీకరణ పత్రం (ప్రస్తుత ఆర్థిక సంవత్సరం)","hi":"आय प्रमाण पत्र (वर्तमान वित्तीय वर्ष)"},"is_mandatory":true,"description":{"en":"Signed by authorized revenue officer showing total parental income below ₹2.5 Lakh.","te":"కుటుంబ ఆదాయం ₹2.5 లక్షల లోపు ఉన్నట్లు రెవెన్యూ అధికారి జారీ చేసిన పత్రం.","hi":"₹2.5 लाख से कम आय दर्शाने वाला राजस्व अधिकारी द्वारा हस्ताक्षरित प्रमाण पत्र।"}},{"id":"marksheet","name":{"en":"Previous Qualifying Examination Marksheet","te":"గత ఉత్తీర్ణత పరీక్ష మార్కుల జాబితా (Marksheet)","hi":"पिछली योग्यता परीक्षा की अंकतालिका"},"is_mandatory":true},{"id":"bonafide-fee","name":{"en":"Bonafide & Fee Receipt from Institution","te":"విద్యాసంస్థ నుండి బోనఫైడ్ మరియు ఫీజు రసీదు","hi":"संस्थान से बोनाफाइड प्रमाणपत्र एवं शुल्क रसीद"},"is_mandatory":true}]'::jsonb,
  '{"en":["Register on the National Scholarship Portal (scholarships.gov.in) with Aadhaar number.","Select Ministry of Social Justice & Empowerment -> Post-Matric SC scheme.","Upload verified Caste and Income certificates.","Submit online and download the acknowledgment for institutional verification."],"te":["ఆధార్ నంబర్‌తో నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (scholarships.gov.in) లో నమోదు చేసుకోండి.","సామాజిక న్యాయ మంత్రిత్వ శాఖ -> పోస్ట్-మెట్రిక్ SC పథకాన్ని ఎంచుకోండి.","ధృవీకరించబడిన కుల మరియు ఆదాయ ధృవీకరణ పత్రాలను అప్‌లోడ్ చేయండి.","ఆన్‌లైన్‌లో సమర్పించి, కళాశాల పరిశీలన కోసం రసీదును ప్రింట్ తీసుకోండి."],"hi":["राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) पर आधार संख्या के साथ पंजीकरण करें।","सामाजिक न्याय मंत्रालय -> पोस्ट-मैट्रिक एससी योजना का चयन करें।","सत्यापित जाति और आय प्रमाण पत्र अपलोड करें।","ऑनलाइन जमा करें और संस्थान सत्यापन के लिए रसीद डाउनलोड करें।"]}'::jsonb,
  '2026-07-01',
  '2026-11-30',
  FALSE,
  'https://scholarships.gov.in/',
  'verified',
  '2026-10-15'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'sc-post-matric-nsp',
  'National Scholarship Portal Official Guidelines',
  'https://scholarships.gov.in/public/schemeGuidelines/MoSJE_SC_Post_Matric.pdf',
  'official_portal',
  '2026-10-15',
  'Confirmed on Ministry of Social Justice portal with updated ₹2.5L income cap.'
);

INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'aicte-pragati-girls',
  'aicte-pragati-scholarship-girl-students',
  '{"en":"AICTE Pragati Scholarship Scheme for Girl Students","te":"బాలికల కోసం AICTE ప్రగతి స్కాలర్‌షిప్ పథకం","hi":"छात्राओं के लिए एआईसीटीई प्रगति छात्रवृत्ति योजना"}'::jsonb,
  '{"en":"All India Council for Technical Education (AICTE), Ministry of Education","te":"అఖిల భారత సాంకేతిక విద్యా మండలి (AICTE), విద్యా మంత్రిత్వ శాఖ","hi":"अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE), शिक्षा मंत्रालय"}'::jsonb,
  'central',
  '{"en":"AICTE initiative aimed at providing assistance for advancement of girls pursuing technical education. Two girl children per family are eligible for degree or diploma courses in AICTE-approved institutions.","te":"సాంకేతిక విద్యను అభ్యసించే బాలికల ఉన్నతి కోసం AICTE కార్యక్రమం. ఒక కుటుంబంలో గరిష్టంగా ఇద్దరు బాలికలకు డిగ్రీ లేదా డిప్లొమా కోర్సులకు ఈ సహాయం వర్తిస్తుంది.","hi":"तकनीकी शिक्षा प्राप्त कर रही बालिकाओं की सहायता हेतु AICTE की योजना। प्रति परिवार अधिकतम दो बालिकाएं AICTE से स्वीकृत संस्थानों में डिग्री या डिप्लोमा हेतु पात्र हैं।"}'::jsonb,
  '{"en":"₹50,000 per annum for every year of study towards college fee payment, computer, books, equipment, and soft software purchase.","te":"కళాశాల ఫీజు, కంప్యూటర్, పుస్తకాలు మరియు ఇతర విద్యా పరికరాల కొనుగోలుకు సంవత్సరానికి ₹50,000 చొప్పున ఆర్థిక సహాయం.","hi":"कॉलेज शुल्क, कंप्यूटर, पुस्तकें, उपकरण एवं सॉफ्टवेयर खरीद हेतु प्रति वर्ष ₹50,000 की वित्तीय सहायता।"}'::jsonb,
  50000,
  '{"undergraduate","diploma"}'::text[],
  '{"All India"}'::text[],
  800000,
  '{"General","OBC","SC","ST","EWS"}'::text[],
  '{"female"}'::text[],
  '[{"id":"gender-female","field":"gender","operator":"equals","value":"female","description":{"en":"Only female students are eligible.","te":"బాలికా విద్యార్థినులు మాత్రమే అర్హులు.","hi":"केवल छात्राएं ही पात्र हैं।"},"is_mandatory":true},{"id":"income-800k","field":"income","operator":"lte","value":800000,"description":{"en":"Family income must be less than ₹8,00,000 per annum.","te":"కుటుంబ వార్షిక ఆదాయం ₹8,00,000 లోపు ఉండాలి.","hi":"पारिवारिक वार्षिक आय ₹8,00,000 से कम होनी चाहिए।"},"is_mandatory":true},{"id":"level-tech","field":"education_level","operator":"in","value":["undergraduate","diploma"],"description":{"en":"Admitted to 1st year of Degree or Diploma in an AICTE approved technical institution.","te":"AICTE గుర్తింపు పొందిన సంస్థలో డిగ్రీ లేదా డిప్లొమా మొదటి సంవత్సరంలో ప్రవేశం పొంది ఉండాలి.","hi":"AICTE अनुमोदित संस्थान में डिग्री या डिप्लोमा के प्रथम वर्ष में प्रवेशित।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"aicte-admission","name":{"en":"Admission Letter issued by Centralized Admission Authority (CET/JEE/State Counseling)","te":"కేంద్రీకృత కౌన్సెలింగ్ అడ్మిషన్ లెటర్ (CET / JEE / స్టేట్ కౌన్సెలింగ్)","hi":"केंद्रीकृत प्रवेश प्राधिकारी (CET/JEE/राज्य काउंसलिंग) द्वारा जारी प्रवेश पत्र"},"is_mandatory":true},{"id":"income-cert-tahsildar","name":{"en":"Family Income Certificate issued by Tahsildar or Competent Authority","te":"తహశీల్దార్ జారీ చేసిన కుటుంబ ఆదాయ ధృవీకరణ పత్రం","hi":"तहसीलदार अथवा सक्षम प्राधिकारी द्वारा जारी परिवार आय प्रमाण पत्र"},"is_mandatory":true},{"id":"bonafide-student","name":{"en":"Study / Bonafide Certificate issued by Head of AICTE Institute","te":"AICTE కళాశాల ప్రిన్సిపాల్ జారీ చేసిన బోనఫైడ్ సర్టిఫికేట్","hi":"AICTE संस्थान के प्रमुख द्वारा जारी बोनाफाइड प्रमाणपत्र"},"is_mandatory":true}]'::jsonb,
  '{"en":["Apply online through the National Scholarship Portal (NSP).","Select AICTE Schemes -> Pragati Scholarship Scheme for Girls.","Ensure institutional verification is completed by your college nodal officer."],"te":["నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (NSP) ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోండి.","AICTE పథకాలు -> బాలికల కోసం ప్రగతి స్కాలర్‌షిప్ పథకాన్ని ఎంచుకోండి.","మీ కళాశాల నోడల్ అధికారి ద్వారా ధృవీకరణ పూర్తయిందని నిర్ధారించుకోండి."],"hi":["राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) के माध्यम से ऑनलाइन आवेदन करें।","AICTE योजनाएं -> छात्राओं के लिए प्रगति छात्रवृत्ति योजना चुनें।","सुनिश्चित करें कि आपके कॉलेज नोडल अधिकारी द्वारा सत्यापन पूरा कर लिया गया है।"]}'::jsonb,
  '2026-07-15',
  '2026-12-31',
  FALSE,
  'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
  'verified',
  '2026-10-18'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'aicte-pragati-girls',
  'AICTE Official Portal Guidelines',
  'https://www.aicte-india.org/sites/default/files/pragati_guidelines.pdf',
  'official_portal',
  '2026-10-18',
  ''
);

INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'pm-yasasvi-scheme',
  'pm-yasasvi-scholarship-obc-ebc-dnt',
  '{"en":"PM-YASASVI Scheme for OBC, EBC & DNT Students","te":"OBC, EBC మరియు DNT విద్యార్థుల కోసం PM-యశస్వి పథకం","hi":"ओबीसी, ईबीसी एवं डीएनटी छात्रों हेतु पीएम-यशस्वी योजना"}'::jsonb,
  '{"en":"Department of Social Justice and Empowerment, Ministry of Social Justice","te":"సామాజిక న్యాయ మరియు సాధికారత విభాగం, భారత ప్రభుత్వం","hi":"सामाजिक न्याय और अधिकारिता विभाग, सामाजिक न्याय मंत्रालय"}'::jsonb,
  'central',
  '{"en":"PM Young Achievers Scholarship Award Scheme for Vibrant India for meritorious Other Backward Classes (OBC), Economically Backward Classes (EBC), and De-notified Nomadic Tribes (DNT) students in Class 9-12 and Top-Class College Education.","te":"9 నుండి 12వ తరగతి చదువుతున్న మరియు టాప్-క్లాస్ కాలేజీలలో చదివే OBC, EBC, మరియు DNT విద్యార్థుల కోసం ప్రధానమంత్రి యశస్వి స్కాలర్‌షిప్ పథకం.","hi":"कक्षा 9 से 12 एवं शीर्ष स्तरीय कॉलेजों में अध्ययनरत ओबीसी, ईबीसी तथा विमुक्त जनजातियों के मेधावी छात्रों हेतु पीएम यशस्वी छात्रवृत्ति योजना।"}'::jsonb,
  '{"en":"Up to ₹75,000 per year for Class 9-10; up to ₹1,25,000 per year for Class 11-12; full tuition fee waiver for notified Top Class Colleges.","te":"9-10 తరగతులకు సంవత్సరానికి ₹75,000 వరకు; 11-12 తరగతులకు ₹1,25,000 వరకు; టాప్ కాలేజీ విద్యార్థులకు పూర్తి ఫీజు రాయితీ.","hi":"कक्षा 9-10 हेतु ₹75,000 प्रति वर्ष; कक्षा 11-12 हेतु ₹1,25,000 प्रति वर्ष; शीर्ष संस्थानों हेतु पूर्ण ट्यूशन शुल्क प्रतिपूर्ति।"}'::jsonb,
  125000,
  '{"class_9_10","class_11_12","undergraduate"}'::text[],
  '{"All India"}'::text[],
  250000,
  '{"OBC","EBC","DNT"}'::text[],
  '{"all"}'::text[],
  '[{"id":"cat-yasasvi","field":"category","operator":"in","value":["OBC","EBC","DNT"],"description":{"en":"Student must belong to OBC, EBC or DNT category.","te":"విద్యార్థి తప్పనిసరిగా OBC, EBC లేదా DNT వర్గానికి చెందినవారై ఉండాలి.","hi":"छात्र अनिवार्य रूप से ओबीसी, ईबीसी अथवा डीएनटी वर्ग से होना चाहिए।"},"is_mandatory":true},{"id":"income-250k-yasasvi","field":"income","operator":"lte","value":250000,"description":{"en":"Annual family income not exceeding ₹2.5 Lakh.","te":"వార్షిక కుటుంబ ఆదాయం ₹2.5 లక్షలకు మించకూడదు.","hi":"वार्षिक पारिवारिक आय ₹2.5 लाख से अधिक न हो।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"obc-ebc-cert","name":{"en":"OBC / EBC / DNT Category Certificate","te":"OBC / EBC / DNT కుల ధృవీకరణ పత్రం","hi":"ओबीसी / ईबीसी / डीएनटी वर्ग प्रमाण पत्र"},"is_mandatory":true},{"id":"income-yasasvi","name":{"en":"Income Certificate issued by Revenue Authority","te":"రెవెన్యూ అధికారి జారీ చేసిన ఆదాయ ధృవీకరణ పత్రం","hi":"राजस्व प्राधिकारी द्वारा जारी आय प्रमाण पत्र"},"is_mandatory":true}]'::jsonb,
  '{"en":["Apply via National Scholarship Portal (NSP) during open call.","School/College conducts primary verification.","Disbursement is made directly to student''s Aadhaar-seeded bank account."],"te":["దరఖాస్తు గడువు సమయంలో నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (NSP) ద్వారా దరఖాస్తు చేసుకోండి.","పాఠశాల / కళాశాల ప్రాథమిక ధృవీకరణ చేస్తుంది.","ఆధార్‌తో అనుసంధానించబడిన బ్యాంక్ ఖాతాకు నేరుగా నిధులు జమ చేయబడతాయి."],"hi":["राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) के माध्यम से ऑनलाइन आवेदन करें।","विद्यालय/महाविद्यालय स्तर पर प्रारंभिक सत्यापन किया जाता है।","छात्रवृत्ति राशि सीधे आधार-लिंक्ड बैंक खाते में भेजी जाती है।"]}'::jsonb,
  '2026-08-01',
  '2026-11-15',
  FALSE,
  'https://socialjustice.gov.in/schemes/31',
  'verified',
  '2026-10-10'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'pm-yasasvi-scheme',
  'Ministry of Social Justice PM-YASASVI Guidelines',
  'https://socialjustice.gov.in/writereaddata/UploadFile/PM_YASASVI.pdf',
  'ministry_gazette',
  '2026-10-10',
  ''
);

INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'jagananna-vidya-deevena-ap',
  'jagananna-vidya-deevena-ap',
  '{"en":"Jagananna Vidya Deevena (AP Post-Matric Fee Reimbursement)","te":"జగనన్న విద్యా దీవెన (పూర్తి ఫీజు రీయింబర్స్‌మెంట్)","hi":"जगनन्ना विद्या दीवेना (आंध्र प्रदेश पूर्ण शुल्क प्रतिपूर्ति)"}'::jsonb,
  '{"en":"Department of Social Welfare, Government of Andhra Pradesh","te":"సాంఘిక సంక్షేమ శాఖ, ఆంధ్రప్రదేశ్ ప్రభుత్వం","hi":"समाज कल्याण विभाग, आंध्र प्रदेश सरकार"}'::jsonb,
  'state',
  '{"en":"Full fee reimbursement scheme provided by Andhra Pradesh Government for students belonging to SC, ST, BC, EBC, Minority, and Kapu categories enrolled in ITI, Polytechnic, Degree, Engineering, and PG courses.","te":"ITI, పాలిటెక్నిక్, డిగ్రీ, ఇంజనీరింగ్, మెడిసిన్ మరియు పీజీ కోర్సుల్లో చేరిన SC, ST, BC, EBC, మైనారిటీ విద్యార్థులకు ఆంధ్రప్రదేశ్ ప్రభుత్వం అందించే సంపూర్ణ ఫీజు రీయింబర్స్‌మెంట్ పథకం.","hi":"आईटीआई, पॉलिटेक्निक, डिग्री, इंजीनियरिंग, मेडिकल और पीजी पाठ्यक्रमों में नामांकित एससी, एसटी, बीसी, ईबीसी और अल्पसंख्यक छात्रों हेतु पूर्ण शुल्क प्रतिपूर्ति योजना।"}'::jsonb,
  '{"en":"100% tuition and institutional fee reimbursement credited in quarterly installments directly to the mother''s verified bank account.","te":"100% ట్యూషన్ ఫీజు రీయింబర్స్‌మెంట్ త్రైమాసిక వాయిదాలలో నేరుగా తల్లి బ్యాంక్ ఖాతాలో జమ చేయబడుతుంది.","hi":"100% ट्यूशन फीस प्रतिपूर्ति त्रैमासिक किस्तों में सीधे माता के बैंक खाते में स्थानांतरित की जाती है।"}'::jsonb,
  NULL,
  '{"diploma","undergraduate","postgraduate"}'::text[],
  '{"Andhra Pradesh"}'::text[],
  250000,
  '{"SC","ST","OBC","EWS","Minority"}'::text[],
  '{"all"}'::text[],
  '[{"id":"ap-state","field":"state","operator":"equals","value":"Andhra Pradesh","description":{"en":"Student must be a resident of Andhra Pradesh.","te":"విద్యార్థి ఆంధ్రప్రదేశ్ నివాసి అయి ఉండాలి.","hi":"छात्र आंध्र प्रदेश का मूल निवासी होना चाहिए।"},"is_mandatory":true},{"id":"income-ap-250k","field":"income","operator":"lte","value":250000,"description":{"en":"Total annual family income must be less than ₹2.5 Lakh.","te":"మొత్తం వార్షిక కుటుంబ ఆదాయం ₹2.5 లక్షల లోపు ఉండాలి.","hi":"कुल वार्षिक पारिवारिक आय ₹2.5 लाख से कम होनी चाहिए।"},"is_mandatory":true},{"id":"ap-land-condition","field":"course","operator":"any","value":"any","description":{"en":"Family must hold less than 10 acres wetland or 25 acres dry land; no four-wheeler (except taxi/auto).","te":"కుటుంబానికి 10 ఎకరాల మాగాణి లేదా 25 ఎకరాల మెట్ట కన్నా తక్కువ భూమి ఉండాలి; నాలుగు చక్రాల వాహనం ఉండకూడదు.","hi":"परिवार के पास 10 एकड़ गीली या 25 एकड़ सूखी भूमि से कम होनी चाहिए; चार पहिया वाहन न हो।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"ap-rice-card","name":{"en":"AP Rice Card / Valid Income Certificate from Grama/Ward Sachivalayam","te":"ఏపీ రైస్ కార్డ్ / గ్రామ-వార్డు సచివాలయం జారీ చేసిన ఆదాయ సర్టిఫికెట్","hi":"आंध्र प्रदेश राइस कार्ड / ग्राम-वार्ड सचिवालय द्वारा जारी आय प्रमाणपत्र"},"is_mandatory":true},{"id":"ap-caste-cert","name":{"en":"Integrated Caste Certificate issued via MeeSeva / Sachivalayam","te":"మీసేవ / సచివాలయం ద్వారా జారీ చేసిన సమగ్ర కుల ధృవీకరణ పత్రం","hi":"मीसेवा / सचिवालय द्वारा जारी एकीकृत जाति प्रमाण पत्र"},"is_mandatory":true},{"id":"mother-aadhaar-bank","name":{"en":"Mother''s Aadhaar linked NPCI Bank Account Passbook","te":"తల్లి ఆధార్-లింక్డ్ బ్యాంక్ ఖాతా పాస్‌బుక్","hi":"माता की आधार-लिंक्ड बैंक खाता पासबुक"},"is_mandatory":true}]'::jsonb,
  '{"en":["College enters student admission details into the Jnanabhumi Portal (jnanabhumi.ap.gov.in).","Student and Mother visit local Grama/Ward Sachivalayam for biometric/iris e-KYC.","Welfare and Education Assistant (WEA) verifies residential criteria."],"te":["కళాశాల జ్ఞానభూమి పోర్టల్ (jnanabhumi.ap.gov.in) లో ప్రవేశ వివరాలను నమోదు చేస్తుంది.","విద్యార్థి మరియు తల్లి స్థానిక గ్రామ/వార్డు సచివాలయంలో బయోమెట్రిక్ ఈ-కేవైసీ పూర్తి చేయాలి.","సంక్షేమ మరియు విద్యా సహాయకుడు క్షేత్రస్థాయి విచారణ పూర్తి చేస్తారు."],"hi":["कॉलेज ज्ञानभूमि पोर्टल (jnanabhumi.ap.gov.in) पर प्रवेश विवरण दर्ज करता है।","छात्र और माता स्थानीय ग्राम/वार्ड सचिवालय में बायोमेट्रिक ई-केवाईसी पूर्ण करें।","कल्याण सहायक द्वारा सत्यापन उपरांत सीधे खाते में अंतरण किया जाता है।"]}'::jsonb,
  '2026-08-01',
  '2026-12-15',
  FALSE,
  'https://jnanabhumi.ap.gov.in/',
  'verified',
  '2026-10-25'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'jagananna-vidya-deevena-ap',
  'Jnanabhumi AP Portal Official Notification',
  'https://jnanabhumi.ap.gov.in/',
  'official_portal',
  '2026-10-25',
  ''
);

INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'telangana-epass-postmatric',
  'telangana-epass-post-matric-scholarship',
  '{"en":"Telangana ePASS Post-Matric Scholarship (RTF & MTF)","te":"తెలంగాణ ఈపాస్ పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (ఫీజు రీయింబర్స్‌మెంట్ & నిర్వహణ భత్యం)","hi":"तेलंगाना ईपास पोस्ट-मैट्रिक छात्रवृत्ति (आरटीएफ और एमटीएफ)"}'::jsonb,
  '{"en":"Welfare Departments (SC, ST, BC, Minority), Government of Telangana","te":"సంక్షేమ శాఖలు (SC, ST, BC, మైనారిటీ), తెలంగాణ ప్రభుత్వం","hi":"कल्याण विभाग (एससी, एसटी, बीसी, अल्पसंख्यक), तेलंगाना सरकार"}'::jsonb,
  'state',
  '{"en":"Reimbursement of Tuition Fee (RTF) and Maintenance Charges (MTF) to SC, ST, BC, EBC, Minority, and Differently Abled students pursuing post-matric courses in recognized institutions within Telangana.","te":"తెలంగాణలోని గుర్తింపు పొందిన విద్యాసంస్థల్లో పోస్ట్-మెట్రిక్ కోర్సులు అభ్యసిస్తున్న SC, ST, BC, EBC, మైనారిటీ విద్యార్థులకు ట్యూషన్ ఫీజు రీయింబర్స్‌మెంట్ మరియు మెస్ నిర్వహణ ఛార్జీలు అందించే పథకం.","hi":"तेलंगाना में मान्यता प्राप्त संस्थानों में उच्च शिक्षा प्राप्त कर रहे एससी, एसटी, बीसी, ईबीसी और अल्पसंख्यक छात्रों हेतु ट्यूशन फीस और रखरखाव भत्ता।"}'::jsonb,
  '{"en":"Full sanctioned tuition fee directly to the college (RTF) plus monthly maintenance allowance up to ₹20,000 per year (MTF) credited to student account.","te":"పూర్తి మంజూరైన ట్యూషన్ ఫీజు కళాశాలకు (RTF) మరియు నెలకు నిర్దేశించిన నిర్వహణ భత్యం విద్యార్థి బ్యాంక్ ఖాతాలో (MTF) జమ చేయబడుతుంది.","hi":"कॉलेज को पूर्ण स्वीकृत ट्यूशन फीस (RTF) तथा छात्र के खाते में प्रति माह रखरखाव भत्ता (MTF)।"}'::jsonb,
  NULL,
  '{"diploma","undergraduate","postgraduate","phd"}'::text[],
  '{"Telangana"}'::text[],
  200000,
  '{"SC","ST","OBC","EWS","Minority"}'::text[],
  '{"all"}'::text[],
  '[{"id":"ts-domicile","field":"state","operator":"equals","value":"Telangana","description":{"en":"Student must be a bona fide resident of Telangana state.","te":"విద్యార్థి తప్పనిసరిగా తెలంగాణ రాష్ట్ర నివాసి అయి ఉండాలి.","hi":"छात्र तेलंगाना राज्य का मूल निवासी होना चाहिए।"},"is_mandatory":true},{"id":"ts-income","field":"income","operator":"lte","value":200000,"description":{"en":"Annual income up to ₹2,00,000 for SC/ST and urban areas; up to ₹1,50,000 for BC rural areas.","te":"SC/ST మరియు పట్టణ ప్రాంతాలకు వార్షిక ఆదాయం ₹2,00,000 లోపు; బీసీ గ్రామీణ ప్రాంతాలకు ₹1,50,000 లోపు.","hi":"एससी/एसटी तथा शहरी क्षेत्रों हेतु आय ₹2,00,000 तक; ग्रामीण बीसी हेतु ₹1,50,000 तक।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"ts-caste","name":{"en":"Telangana MeeSeva Caste Certificate with Barcode","te":"బార్‌కోడ్‌తో కూడిన తెలంగాణ మీసేవ కుల ధృవీకరణ పత్రం","hi":"बारकोड युक्त तेलंगाना मीसेवा जाति प्रमाण पत्र"},"is_mandatory":true},{"id":"ts-income-cert","name":{"en":"Latest MeeSeva Income Certificate issued on or after current fiscal year","te":"ప్రస్తుత ఆర్థిక సంవత్సరం జారీ చేసిన మీసేవ ఆదాయ ధృవీకరణ పత్రం","hi":"वर्तमान वित्तीय वर्ष में जारी नवीनतम मीसेवा आय प्रमाण पत्र"},"is_mandatory":true},{"id":"ts-ssc-memo","name":{"en":"SSC Hall Ticket Number and Memo","te":"పదవ తరగతి (SSC) హాల్ టికెట్ నంబర్ మరియు మార్కుల మెమో","hi":"दसवीं (एसएससी) हॉल टिकट नंबर और अंकतालिका"},"is_mandatory":true}]'::jsonb,
  '{"en":["Apply online on telanganaepass.cgg.gov.in under Post-Matric Service.","Enter SSC details, Aadhaar number, and admission CET rank.","Upload scanned certificates (Caste, Income, Bank Passbook, Bonafide).","Submit hard copy with signatures to college principal for verification."],"te":["telanganaepass.cgg.gov.in లో పోస్ట్-మెట్రిక్ సేవల కింద ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోండి.","పదవ తరగతి వివరాలు, ఆధార్ మరియు కౌన్సెలింగ్ ర్యాంకును నమోదు చేయండి.","సర్టిఫికెట్లను స్కాన్ చేసి అప్‌లోడ్ చేయండి.","ప్రింటవుట్ కాపీని సంతకాలతో కళాశాలలో సమర్పించండి."],"hi":["telanganaepass.cgg.gov.in पर पोस्ट-मैट्रिक सेवा के अंतर्गत आवेदन करें।","दसवीं कक्षा का विवरण, आधार संख्या और प्रवेश रैंक दर्ज करें।","प्रमाण पत्र अपलोड करें और कॉलेज में सत्यापन हेतु हार्ड कॉपी जमा करें।"]}'::jsonb,
  '2026-07-20',
  '2026-11-20',
  FALSE,
  'https://telanganaepass.cgg.gov.in/',
  'verified',
  '2026-10-12'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'telangana-epass-postmatric',
  'Telangana ePASS Official Web Portal',
  'https://telanganaepass.cgg.gov.in/',
  'official_portal',
  '2026-10-12',
  ''
);

INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'reliance-foundation-ug',
  'reliance-foundation-undergraduate-scholarships',
  '{"en":"Reliance Foundation Undergraduate Scholarship","te":"రిలయన్స్ ఫౌండేషన్ అండర్ గ్రాడ్యుయేట్ స్కాలర్‌షిప్","hi":"रिलायंस फाउंडेशन अंडरग्रेजुएट स्कॉलरशिप"}'::jsonb,
  '{"en":"Reliance Foundation","te":"రిలయన్స్ ఫౌండేషన్","hi":"रिलायंस फाउंडेशन"}'::jsonb,
  'private',
  '{"en":"Merit-cum-means scholarship supporting up to 5,000 undergraduate students across India in any field of study, fostering future leaders who demonstrate academic potential and commitment to social impact.","te":"భారతదేశవ్యాప్తంగా ఏ రంగంలోనైనా మొదటి సంవత్సరం అండర్ గ్రాడ్యుయేట్ చదువుతున్న 5,000 మంది ప్రతిభావంతులైన విద్యార్థులకు అందించే మెరిట్-కమ్-మీన్స్ ప్రైవేట్ స్కాలర్‌షిప్.","hi":"भारत भर में किसी भी संकाय में प्रथम वर्ष स्नातक के 5,000 मेधावी एवं जरूरतमंद छात्रों हेतु रिलायंस फाउंडेशन की मेरिट-कम-मीन्स छात्रवृत्ति।"}'::jsonb,
  '{"en":"Grants up to ₹2,00,000 over the duration of the degree program, plus leadership mentorship and alumni network development.","te":"డిగ్రీ పూర్తయ్యే కాలానికి గరిష్టంగా ₹2,00,000 వరకు గ్రాంట్, మరియు లీడర్‌షిప్ మెంటార్‌షిప్ సదుపాయం.","hi":"डिग्री कार्यक्रम के दौरान ₹2,00,000 तक की छात्रवृत्ति एवं नेतृत्व परामर्श सहायता।"}'::jsonb,
  200000,
  '{"undergraduate"}'::text[],
  '{"All India"}'::text[],
  1500000,
  '{"General","OBC","SC","ST","EWS"}'::text[],
  '{"all"}'::text[],
  '[{"id":"rf-citizen","field":"state","operator":"any","value":"any","description":{"en":"Resident citizen of India.","te":"భారతీయ పౌరుడై ఉండాలి.","hi":"भारतीय नागरिक होना चाहिए।"},"is_mandatory":true},{"id":"rf-marks","field":"minimum_marks","operator":"gte","value":60,"description":{"en":"Passed standard 12th examination with a minimum of 60% aggregate.","te":"12వ తరగతి లేదా ఇంటర్మీడియట్ పరీక్షలో కనీసం 60% మార్కులు సాధించి ఉండాలి.","hi":"12वीं कक्षा में कम से कम 60% अंक प्राप्त किए हों।"},"is_mandatory":true},{"id":"rf-first-year","field":"education_level","operator":"equals","value":"undergraduate","description":{"en":"Enrolled in 1st year of full-time undergraduate degree program.","te":"పూర్తి స్థాయి రెగ్యులర్ అండర్ గ్రాడ్యుయేట్ డిగ్రీ మొదటి సంవత్సరంలో చేరి ఉండాలి.","hi":"नियमित स्नातक डिग्री कार्यक्रम के प्रथम वर्ष में नामांकित।"},"is_mandatory":true},{"id":"rf-income","field":"income","operator":"lte","value":1500000,"description":{"en":"Annual household income up to ₹15 Lakhs (preference given to < ₹2.5 Lakhs).","te":"వార్షిక కుటుంబ ఆదాయం ₹15 లక్షల లోపు (₹2.5 లక్షల లోపు వారికి ప్రాధాన్యత).","hi":"वार्षिक पारिवारिक आय ₹15 लाख तक (₹2.5 लाख से कम वालों को प्राथमिकता)।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"rf-12th-memo","name":{"en":"12th / Intermediate Marksheet","te":"12వ తరగతి / ఇంటర్మీడియట్ మార్కుల పత్రం","hi":"12वीं / इंटरमीडिएट अंकतालिका"},"is_mandatory":true},{"id":"rf-college-id","name":{"en":"College Identity Card or Bonafide Admission Letter","te":"కళాశాల గుర్తింపు కార్డు లేదా బోనఫైడ్ అడ్మిషన్ లెటర్","hi":"कॉलेज पहचान पत्र अथवा प्रवेश पत्र"},"is_mandatory":true},{"id":"rf-income-proof","name":{"en":"Family Income Proof (ITR / Salary Slip / Revenue Officer Certificate)","te":"కుటుంబ ఆదాయ ధృవీకరణ (ITR / సాలరీ స్లిప్ / రెవెన్యూ సర్టిఫికెట్)","hi":"आय प्रमाण (आईटीआर / वेतन पर्ची / राजस्व अधिकारी प्रमाणपत्र)"},"is_mandatory":true}]'::jsonb,
  '{"en":["Register on reliancefoundation.org official portal.","Complete online application and mandatory 60-minute aptitude test.","Shortlisted candidates are selected based on test score and financial need."],"te":["రిలయన్స్ ఫౌండేషన్ అధికారిక పోర్టల్‌లో నమోదు చేసుకోండి.","ఆన్‌లైన్ దరఖాస్తును మరియు 60 నిమిషాల ఆప్టిట్యూడ్ పరీక్షను పూర్తి చేయండి.","పరీక్ష మార్కులు మరియు ఆర్థిక పరిస్థితి ఆధారంగా ఎంపిక చేయబడతారు."],"hi":["रिलायंस फाउंडेशन के आधिकारिक पोर्टल पर पंजीकरण करें।","ऑनलाइन आवेदन और 60 मिनट की ऑनलाइन अभिरुचि परीक्षा पूर्ण करें।","मेरिट और वित्तीय आवश्यकता के आधार पर अंतिम चयन किया जाता है।"]}'::jsonb,
  '2026-08-15',
  '2026-10-31',
  FALSE,
  'https://www.reliancefoundation.org/our-work/education/scholarships',
  'verified',
  '2026-10-20'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'reliance-foundation-ug',
  'Reliance Foundation Official Portal',
  'https://www.reliancefoundation.org/our-work/education/scholarships',
  'foundation_announcement',
  '2026-10-20',
  ''
);

INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'nmmss-ministry-education',
  'national-means-cum-merit-scholarship-scheme',
  '{"en":"National Means-cum-Merit Scholarship Scheme (NMMSS)","te":"నేషనల్ మీన్స్-కమ్-మెరిట్ స్కాలర్‌షిప్ పథకం (NMMSS)","hi":"राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति योजना (एनएमएमएसएस)"}'::jsonb,
  '{"en":"Department of School Education & Literacy, Ministry of Education","te":"పాఠశాల విద్య & అక్షరాస్యత విభాగం, కేంద్ర విద్యా మంత్రిత్వ శాఖ","hi":"स्कूल शिक्षा और साक्षरता विभाग, शिक्षा मंत्रालय"}'::jsonb,
  'central',
  '{"en":"Central Sector Scheme to award scholarships to meritorious students of economically weaker sections to arrest their drop-out at class 8 and encourage them to continue study at secondary stage.","te":"ఆర్థికంగా వెనుకబడిన వర్గాల ప్రతిభావంతులైన విద్యార్థులు 8వ తరగతి తర్వాత చదువు మానేయకుండా నిరోధించడానికి మరియు సెకండరీ విద్యను పూర్తి చేసేలా ప్రోత్సహించడానికి కేంద్ర పథకం.","hi":"आर्थिक रूप से कमजोर वर्गों के मेधावी छात्रों को कक्षा 8 के बाद पढ़ाई छोड़ने से रोकने एवं माध्यमिक स्तर तक जारी रखने हेतु केंद्र सरकार की योजना।"}'::jsonb,
  '{"en":"₹12,000 per annum (₹1,000 per month) from Class 9 to Class 12 in State Government, Government-aided and local body schools.","te":"ప్రభుత్వ లేదా ఎయిడెడ్ పాఠశాలల్లో 9వ తరగతి నుండి 12వ తరగతి వరకు సంవత్సరానికి ₹12,000 (నెలకు ₹1,000) ఆర్థిక సహాయం.","hi":"सरकारी या सहायता प्राप्त विद्यालयों में कक्षा 9 से 12 तक प्रति वर्ष ₹12,000 (₹1,000 प्रति माह)।"}'::jsonb,
  12000,
  '{"class_9_10","class_11_12"}'::text[],
  '{"All India"}'::text[],
  350000,
  '{"General","OBC","SC","ST","EWS"}'::text[],
  '{"all"}'::text[],
  '[{"id":"nmms-exam","field":"minimum_marks","operator":"gte","value":55,"description":{"en":"Minimum 55% marks or equivalent grade in Class 7 examination (50% for SC/ST).","te":"7వ తరగతి వార్షిక పరీక్షల్లో కనీసం 55% మార్కులు సాధించి ఉండాలి (SC/ST లకు 50%).","hi":"कक्षा 7 में न्यूनतम 55% अंक या समकक्ष ग्रेड (एससी/एसटी हेतु 50%)।"},"is_mandatory":true},{"id":"nmms-income","field":"income","operator":"lte","value":350000,"description":{"en":"Parental annual income from all sources not exceeding ₹3,50,000.","te":"తల్లిదండ్రుల వార్షిక ఆదాయం ₹3,50,000 మించకూడదు.","hi":"माता-पिता की कुल वार्षिक आय ₹3,50,000 से अधिक न हो।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"nmms-selection","name":{"en":"NMMS Selection Test Scorecard / Merit List Copy","te":"NMMS ఎంపిక పరీక్ష స్కోర్‌కార్డ్ / మెరిట్ జాబితా కాపీ","hi":"एनएमएमएस चयन परीक्षा स्कोरकार्ड / मेरिट सूची प्रति"},"is_mandatory":true},{"id":"nmms-income-cert","name":{"en":"Income Certificate issued by Revenue Competent Authority","te":"రెవెన్యూ అధికారి జారీ చేసిన ఆదాయ సర్టిఫికెట్","hi":"सक्षम राजस्व प्राधिकारी द्वारा जारी आय प्रमाणपत्र"},"is_mandatory":true}]'::jsonb,
  '{"en":["Qualify the state-level NMMS selection test in Class 8.","Register and verify details on National Scholarship Portal (NSP).","Disbursement occurs through DBT directly into student bank account."],"te":["8వ తరగతిలో రాష్ట్ర స్థాయి NMMS ఎంపిక పరీక్షలో అర్హత సాధించండి.","నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (NSP) లో వివరాలు నమోదు చేసి ధృవీకరించుకోండి.","DBT ద్వారా నేరుగా విద్యార్థి బ్యాంక్ ఖాతాలో నిధులు జమ చేయబడతాయి."],"hi":["कक्षा 8 में राज्य स्तरीय एनएमएमएस परीक्षा उत्तीर्ण करें।","राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर विवरण पंजीकृत करें।","डीबीटी के माध्यम से सीधे छात्र के बैंक खाते में राशि भेजी जाती है।"]}'::jsonb,
  '2026-07-01',
  '2026-11-30',
  FALSE,
  'https://dsel.education.gov.in/scheme/nmmss',
  'verified',
  '2026-10-15'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'nmmss-ministry-education',
  'Ministry of Education NMMSS Scheme Rules',
  'https://dsel.education.gov.in/scheme/nmmss',
  'official_portal',
  '2026-10-15',
  ''
);

INSERT INTO public.scholarships (
  id, slug, title, provider, scheme_type, description, benefits, award_amount,
  education_levels, eligible_states, income_limit, applicable_categories, applicable_genders,
  eligibility_conditions, required_documents, application_instructions,
  opening_date, closing_date, is_deadline_tentative, official_url, verification_status, last_verified_at
) VALUES (
  'begum-hazrat-mahal-girls',
  'begum-hazrat-mahal-national-scholarship',
  '{"en":"Begum Hazrat Mahal National Scholarship for Minority Girls","te":"మైనారిటీ బాలికల కోసం బేగం హజ్రత్ మహల్ జాతీయ స్కాలర్‌షిప్","hi":"अल्पसंख्यक छात्राओं हेतु बेगम हज़रत महल राष्ट्रीय छात्रवृत्ति"}'::jsonb,
  '{"en":"Ministry of Minority Affairs / Maulana Azad Education Foundation","te":"మైనారిటీ వ్యవహారాల మంత్రిత్వ శాఖ, భారత ప్రభుత్వం","hi":"अल्पसंख्यक कार्य मंत्रालय, भारत सरकार"}'::jsonb,
  'central',
  '{"en":"Provides scholarship assistance to meritorious girl students belonging to six notified minority communities (Muslims, Christians, Sikhs, Buddhists, Jains, and Parsis) studying in Classes 9 to 12.","te":"నోటిఫై చేయబడిన ఆరు మైనారిటీ వర్గాలకు (ముస్లిం, క్రైస్తవ, సిక్కు, బౌద్ధ, జైన, పార్సీ) చెందిన 9 నుండి 12వ తరగతి చదువుతున్న బాలికలకు అందజేసే జాతీయ స్కాలర్‌షిప్.","hi":"कक्षा 9 से 12 में अध्ययनरत छह अधिसूचित अल्पसंख्यक समुदायों (मुस्लिम, ईसाई, सिख, बौद्ध, जैन और पारसी) की मेधावी छात्राओं हेतु राष्ट्रीय छात्रवृत्ति।"}'::jsonb,
  '{"en":"₹5,000 per annum for Class 9 and 10; ₹6,000 per annum for Class 11 and 12.","te":"9 మరియు 10వ తరగతులకు సంవత్సరానికి ₹5,000; 11 మరియు 12వ తరగతులకు ₹6,000.","hi":"कक्षा 9 एवं 10 हेतु ₹5,000 प्रति वर्ष; कक्षा 11 एवं 12 हेतु ₹6,000 प्रति वर्ष।"}'::jsonb,
  6000,
  '{"class_9_10","class_11_12"}'::text[],
  '{"All India"}'::text[],
  200000,
  '{"Minority"}'::text[],
  '{"female"}'::text[],
  '[{"id":"bhm-minority","field":"category","operator":"equals","value":"Minority","description":{"en":"Must belong to notified minority community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).","te":"నోటిఫై చేయబడిన మైనారిటీ సమాజానికి చెందినవారై ఉండాలి.","hi":"अधिसूचित अल्पसंख्यक समुदाय से संबंधित होना अनिवार्य है।"},"is_mandatory":true},{"id":"bhm-gender","field":"gender","operator":"equals","value":"female","description":{"en":"Only female students are eligible.","te":"బాలికలకు మాత్రమే వర్తిస్తుంది.","hi":"केवल छात्राओं के लिए मान्य।"},"is_mandatory":true},{"id":"bhm-marks","field":"minimum_marks","operator":"gte","value":50,"description":{"en":"Minimum 50% marks or equivalent grade in qualifying previous class examination.","te":"మునుపటి తరగతి పరీక్షల్లో కనీసం 50% మార్కులు సాధించి ఉండాలి.","hi":"पिछली कक्षा की परीक्षा में न्यूनतम 50% अंक।"},"is_mandatory":true},{"id":"bhm-income","field":"income","operator":"lte","value":200000,"description":{"en":"Annual income of parents from all sources not exceeding ₹2,00,000.","te":"తల్లిదండ్రుల వార్షిక ఆదాయం ₹2,00,000 మించకూడదు.","hi":"माता-पिता की वार्षिक आय ₹2,00,000 से अधिक न हो।"},"is_mandatory":true}]'::jsonb,
  '[{"id":"bhm-minority-cert","name":{"en":"Self-Declaration of Minority Community Certificate","te":"మైనారిటీ కమ్యూనిటీ స్వీయ ప్రకటన పత్రం","hi":"अल्पसंख्यक समुदाय स्व-घोषणा पत्र"},"is_mandatory":true},{"id":"bhm-income-doc","name":{"en":"Income Certificate issued by competent revenue authority","te":"సమర్థ రెవెన్యూ అధికారి జారీ చేసిన ఆదాయ ధృవీకరణ పత్రం","hi":"सक्षम राजस्व प्राधिकारी द्वारा जारी आय प्रमाणपत्र"},"is_mandatory":true}]'::jsonb,
  '{"en":["Apply online via National Scholarship Portal (scholarships.gov.in).","Fill student particulars and upload institution verification certificate."],"te":["నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (scholarships.gov.in) ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోండి.","వివరాలు నమోదు చేసి పాఠశాల ధృవీకరణ పత్రాన్ని సమర్పించండి."],"hi":["राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) के माध्यम से ऑनलाइन आवेदन करें।","विवरण भरें और विद्यालय सत्यापन पत्र अपलोड करें।"]}'::jsonb,
  '2026-07-15',
  '2026-11-30',
  FALSE,
  'https://scholarships.gov.in/',
  'verified',
  '2026-10-15'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  scheme_type = EXCLUDED.scheme_type,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  award_amount = EXCLUDED.award_amount,
  education_levels = EXCLUDED.education_levels,
  eligible_states = EXCLUDED.eligible_states,
  income_limit = EXCLUDED.income_limit,
  applicable_categories = EXCLUDED.applicable_categories,
  applicable_genders = EXCLUDED.applicable_genders,
  eligibility_conditions = EXCLUDED.eligibility_conditions,
  required_documents = EXCLUDED.required_documents,
  application_instructions = EXCLUDED.application_instructions,
  opening_date = EXCLUDED.opening_date,
  closing_date = EXCLUDED.closing_date,
  is_deadline_tentative = EXCLUDED.is_deadline_tentative,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = EXCLUDED.last_verified_at;

INSERT INTO public.scholarship_sources (
  scholarship_id, source_name, source_url, source_type, checked_at, verification_notes
) VALUES (
  'begum-hazrat-mahal-girls',
  'Ministry of Minority Affairs Begum Hazrat Mahal Guidelines',
  'https://minorityaffairs.gov.in/',
  'official_portal',
  '2026-10-15',
  ''
);

