# VidyaPath AI - Development Plan

## 1. Project Overview & Vision
VidyaPath AI is a premium, accessible, and multilingual Indian scholarship intelligence and discovery platform. It empowers students across India to discover verified scholarship schemes, understand complex eligibility criteria in plain regional language, organize required documentation, track their applications reliably, and consult a grounded AI assistant.

- **Primary Target Audience**: Indian students across high school, diploma, undergraduate, postgraduate, and doctoral levels.
- **Languages Supported**: English, Telugu (తెలుగు), Hindi (हिंदी).
- **Core Product Promise**: *"Find the support that moves you forward."*
- **Primary Design Aesthetic**: High-clarity editorial & precision interface inspired by Stripe's information architecture, Linear's clean density, Apple's whitespace/typography, and Vercel's technical restraint.

---

## 2. Brand & Design System Tokens

The visual weight adheres to the strict 60 / 30 / 10 brand color balance:

```css
:root {
  /* 60% Dominant Primary Neutral */
  --storm-grey: #747D87;
  --storm-grey-light: #9BA3AB;
  --storm-grey-dark: #4B535C;
  
  /* 30% Structural Depth & Precision */
  --matte-black: #17191C;
  --matte-black-subtle: #22262B;
  
  /* 10% High-Intent Accent / CTA */
  --safety-orange: #F47B20;
  --safety-orange-hover: #D96914;
  --safety-orange-subtle: rgba(244, 123, 32, 0.08);

  /* Backgrounds & Surfaces */
  --warm-white: #F5F4F0;
  --surface: #FFFFFF;
  --surface-muted: #F8F9FA;

  /* Typography & Dividers */
  --text-main: #17191C;
  --muted-text: #69717A;
  --border: #DCE0E3;
  --border-focus: #747D87;

  /* Semantic Feedback */
  --success: #26734D;
  --success-subtle: rgba(38, 115, 77, 0.08);
  --danger: #B83C32;
  --danger-subtle: rgba(184, 60, 50, 0.08);
  --warning: #C07000;
  --warning-subtle: rgba(192, 112, 0, 0.08);
}
```

### Typography Scale
- **Primary Font**: `Geist Sans`, sans-serif
- **Secondary / Body Font**: `Inter`, sans-serif
- **Code & Scheme Reference IDs**: `Geist Mono`, monospace

### Design Principles & Hard Restrictions
- **Zero purple gradients / AI bubbles / fake testimonials / emoji icons**.
- **No decorative glassmorphism** on content cards; solid, accessible surfaces with WCAG 2.2 AA compliant contrast.
- Lucide React SVG icons with consistent 1.75px stroke width.
- Indian mobile-first responsive architecture.

---

## 3. Technology Stack & Architecture

### Frontend
- **Framework**: React 18 / 19 with TypeScript
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS with custom VidyaPath semantic tokens & CSS variables
- **Routing**: React Router DOM (v6/v7)
- **UI Components**: Headless primitives (Radix UI) & custom accessible components conforming to shadcn patterns
- **Forms & Validation**: React Hook Form + Zod
- **Data Fetching & State**: TanStack Query (v5)

### Backend & Storage
- **Platform**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Supabase Edge Functions / Storage)
- **Database Schema**: Fully relational, indexed, normalized schemas with granular RLS policies for public guest access, student isolated data, and admin-only management.

### AI Engine (Provider Agnostic)
- **Architecture**: Retrieval-Augmented Generation (RAG) querying verified scholarship rows.
- **Provider Adapter**: Abstract LLM client supporting OpenRouter, OpenAI, and Gemini API via unified interface.
- **Strict Guardrails**: Grounded answers only; explicit missing data disclosures; strict refusal to act as an official government representative or invent deadlines.

### Multilingual Layer
- High-fidelity dictionaries for English, Telugu, and Hindi covering all navigation, UI elements, scheme taxonomy, eligibility terms, and status indicators.

---

## 4. Phase-by-Phase Execution Plan

1. **Phase 1: Inspection, Foundations & Workspace Setup**
   - Verify environment tools (Node 24, npm 11, git).
   - Initialize Vite React TypeScript project.
   - Install core dependencies (Tailwind, Lucide, Radix, Router, React Hook Form, Zod, TanStack Query, Supabase client).
   - Configure Tailwind with VidyaPath design tokens.
   - Establish directory structure (`src/`, `components/`, `features/`, `locales/`, `types/`, `services/`, `supabase/`).

2. **Phase 2: Design System, Tokens & Navigation**
   - Setup global typography and CSS variables.
   - Build accessible core UI components (Button, Input, Badge, Card, Dialog, Select, Tabs, Dropdown).
   - Implement responsive Header with Brand Wordmark, Nav Links, Language Switcher, and Auth Status.
   - Implement comprehensive Footer with official disclaimers, contact placeholders, and navigation.

3. **Phase 3: Multilingual Engine & Internationalization**
   - Structured JSON/TypeScript locale dictionaries for English (`en`), Telugu (`te`), and Hindi (`hi`).
   - Context provider & hook (`useTranslation`, `useLanguage`) enabling dynamic switching without page reload.

4. **Phase 4: Database Migrations, RLS & Seed Data**
   - Create SQL migrations in `supabase/migrations/`:
     - `scholarships` (comprehensive scheme attributes, verification metadata).
     - `scholarship_sources` (official URLs, verification notes).
     - `profiles` (student state, category, education, language preference).
     - `saved_scholarships` (user bookmarks).
     - `applications` (user application progress tracking).
     - `application_checklist_items` (per-application required documents checklist).
     - `notifications` & `notification_preferences`.
     - `assistant_conversations` & `assistant_messages`.
     - `admin_audit_logs`.
   - Setup strict Row Level Security (RLS) policies.
   - Prepare comprehensive seed dataset of verified, realistic Central & State Indian scholarships (National Scholarship Portal, Post-Matric, PM-YASASVI, Pragati, Begum Hazrat Mahal, Reliance Foundation, etc.).

5. **Phase 5: Public Experience & Discovery**
   - **Landing Page**: Spacious hero, verified scheme highlights, interactive search preview, 3-step value prop, multilingual showcase, trust & verification manifesto.
   - **Scholarship Discovery (`/scholarships`)**: Multi-faceted filter system (Central/State/Private, Education level, State, Income, Category, Status). Sorting, pagination, keyword search, mobile filter drawer.
   - **Scholarship Detail (`/scholarships/:slug`)**: Full scheme specification, eligibility criteria breakdown, required documents list, official source URLs, last-verified badge, and direct actions.

6. **Phase 6: Eligibility Engine & Calculator (`/eligibility`)**
   - Deterministic evaluation engine comparing student profile inputs (State, Level, Course, Family Income, Gender, Category) against verified rule sets.
   - Returns structured status: *Appears eligible*, *Potentially eligible (more information needed)*, *Not eligible*, with detailed condition-by-condition transparency.

7. **Phase 7: Grounded Multilingual AI Assistant (`/assistant`)**
   - Abstract AI Service supporting OpenRouter/OpenAI/Gemini.
   - Dynamic prompt construction grounded strictly on verified scholarship database records.
   - Citations with exact source URLs.
   - Guest rate limiting and persistent session support for registered users.
   - Pre-canned prompt suggestions in English, Telugu, and Hindi.

8. **Phase 8: Student Dashboard & Application Tracking**
   - Guest-first philosophy: smooth optional authentication via Supabase Auth.
   - Student Profile (`/profile`) with education & demographic preferences.
   - Saved Scholarships (`/saved-scholarships`).
   - Application Tracker (`/applications`) with user-managed lifecycle stages (*Interested*, *Preparing documents*, *Ready to apply*, *Submitted*, *Under review*, *Approved*, *Rejected*).
   - Document Checklist (`/documents`) per application.
   - Deadline Dashboard (`/dashboard`) showing confirmed application timelines in IST.

9. **Phase 9: Admin Dashboard & Verification (`/admin`)**
   - Role-based access control protecting admin endpoints.
   - Scheme management (CRUD, publish/archive, update verification dates).
   - Source audit log & verification review.

10. **Phase 10: Legal, Compliance, Accessibility & Production Readiness**
    - Accessible, compliant `/about`, `/privacy`, `/terms`, `/contact` routes.
    - Full keyboard navigation & WCAG 2.2 AA contrast compliance check.
    - Automated tests (unit, integration, routing, eligibility logic).
    - Production build verification (`npm run build`).
    - Deployment guides for Vercel + Supabase.
