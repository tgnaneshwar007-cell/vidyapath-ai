# VidyaPath AI - Changelog

All notable changes to the VidyaPath AI platform are documented in this file.

## [1.0.0] - 2026-11-15

### Added
- **Core Architecture & Workspace**:
  - Bootstrapped React 18, TypeScript, Vite, Tailwind CSS, and React Router v6.
  - Implemented 60/30/10 design system tokens (Storm Grey, Matte Black, Safety Orange) adhering to WCAG 2.2 AA contrast standards.
- **Multilingual Support**:
  - Complete native localization dictionaries for English, Telugu (తెలుగు), and Hindi (हिंदी).
  - Synchronous `LanguageProvider` with HTML `lang` attribute synchronisation.
- **Verified Scholarship Dataset & Repository**:
  - Grounded dataset of Central, State (Andhra Pradesh, Telangana), and Private schemes with confirmed deadlines in IST.
  - Sourced from National Scholarship Portal (NSP), AICTE, Jnanabhumi, Telangana ePASS, and Reliance Foundation.
- **Deterministic Eligibility Evaluator**:
  - Pure rule evaluation engine computing condition-by-condition verdicts (*Appears eligible*, *Potentially eligible*, *Not eligible*).
  - Live transparent report card.
- **Grounded Multilingual AI Assistant**:
  - RAG pipeline grounding prompt completions in verified database records.
  - Clickable verified source citations and deterministic fallback responder.
- **Application Tracker & Document Checklist**:
  - Personal milestone tracker with status progression.
  - Interactive document readiness checklists for Income, Caste, and Bonafide certificates.
- **Compliance & Legal Pages**:
  - Accessible `/about`, `/privacy`, `/terms`, `/contact`, and `/admin` routes.
- **Database & RLS**:
  - Comprehensive migration `20261115000000_initial_schema.sql` with Row Level Security policies across all tables.
- **Testing & Quality Assurance**:
  - 19 automated Vitest tests passing covering eligibility logic, search/filtering, multilingual dictionaries, and AI grounding.
  - Successful production build (`npm run build`).
