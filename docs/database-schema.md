# VidyaPath AI - Database Schema & Row Level Security

## 1. Tables Overview

### `public.profiles`
Stores student background, domicile, education level, and preferences.
- `id` (UUID, Primary Key, references `auth.users(id) ON DELETE CASCADE`)
- `full_name` (TEXT)
- `email` (TEXT)
- `preferred_language` (VARCHAR(5), CHECK in ('en', 'te', 'hi'))
- `state` (TEXT)
- `education_level` (TEXT)
- `course` (TEXT)
- `annual_family_income` (NUMERIC(12, 2))
- `category` (TEXT)
- `gender` (TEXT)
- `is_admin` (BOOLEAN DEFAULT FALSE)
- `consent_preferences` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `public.scholarships`
Stores verified Indian scholarship schemes with multilingual translations.
- `id` (TEXT, Primary Key)
- `slug` (TEXT UNIQUE)
- `title` (JSONB: { en, te, hi })
- `provider` (JSONB: { en, te, hi })
- `scheme_type` (VARCHAR(20), CHECK in ('central', 'state', 'private'))
- `description` (JSONB: { en, te, hi })
- `benefits` (JSONB: { en, te, hi })
- `award_amount` (NUMERIC(12, 2))
- `education_levels` (TEXT[])
- `eligible_states` (TEXT[])
- `income_limit` (NUMERIC(12, 2))
- `applicable_categories` (TEXT[])
- `applicable_genders` (TEXT[])
- `eligibility_conditions` (JSONB)
- `required_documents` (JSONB)
- `application_instructions` (JSONB)
- `opening_date`, `closing_date` (DATE)
- `official_url` (TEXT)
- `verification_status` (VARCHAR(20), CHECK in ('verified', 'pending', 'unverified'))
- `last_verified_at` (TIMESTAMPTZ)

### `public.scholarship_sources`
Tracks official portals, gazettes, and verification audits.
- `id` (UUID, Primary Key)
- `scholarship_id` (TEXT, references `scholarships(id) ON DELETE CASCADE`)
- `source_name` (TEXT)
- `source_url` (TEXT)
- `source_type` (VARCHAR(30))
- `checked_at` (TIMESTAMPTZ)
- `verification_notes` (TEXT)

### `public.applications`
User-managed progress tracking.
- `id` (UUID, Primary Key)
- `user_id` (UUID, references `profiles(id) ON DELETE CASCADE`)
- `scholarship_id` (TEXT, references `scholarships(id) ON DELETE CASCADE`)
- `stage` (VARCHAR(30), CHECK in ('interested', 'preparing_documents', 'ready_to_apply', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'))
- `notes` (TEXT)
- `application_number` (TEXT)
- `submission_date` (DATE)
- `reminder_enabled` (BOOLEAN)

---

## 2. Row Level Security (RLS) Matrix

| Table | Operation | Public (Guest) | Authenticated Student | Administrator |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | SELECT | Denied | Own Profile Only | All Profiles |
| `profiles` | UPDATE | Denied | Own Profile Only | All Profiles |
| `scholarships` | SELECT | Public Read | Public Read | Full Access |
| `scholarships` | INSERT/UPDATE/DELETE | Denied | Denied | Allowed |
| `saved_scholarships` | ALL | Denied | Own Rows Only | Denied |
| `applications` | ALL | Denied | Own Rows Only | Denied |
| `admin_audit_logs` | SELECT/INSERT | Denied | Denied | Allowed |
