# VidyaPath AI - Architecture & Technical Specification

## 1. System Overview
VidyaPath AI is structured into independent, highly cohesive modules designed for high availability, low latency across Indian mobile network environments, and strict compliance with WCAG 2.2 AA accessibility standards.

```
                    ┌────────────────────────────┐
                    │      VidyaPath Client      │
                    │ React + TypeScript + Vite  │
                    │  Tailwind CSS (60/30/10)   │
                    └─────────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Discovery Engine │    │  Deterministic   │    │ Multilingual RAG │
│ Search, Filters, │    │Eligibility Engine│    │   AI Assistant   │
│  State & Level   │    │ Transparent Rules│    │ Verified Context │
└────────┬─────────┘    └─────────┬────────┘    └─────────┬────────┘
         │                        │                       │
         └────────────────────────┼───────────────────────┘
                                  │
                                  ▼
                   ┌──────────────────────────────┐
                   │    Data & Storage Layer      │
                   │ Supabase PostgreSQL + RLS    │
                   │  (Verified Bundled Fallback) │
                   └──────────────────────────────┘
```

---

## 2. Frontend Modules & Responsibilities

1. **Brand Layout & Internationalization (`src/locales`, `src/components/layout`)**:
   - Manages dynamic switching across English (`en`), Telugu (`te`), and Hindi (`hi`).
   - Reflects the strict 60% Storm Grey, 30% Matte Black, and 10% Safety Orange color tokens.
   - Synchronizes `document.documentElement.lang` for assistive technology and screen readers.

2. **Scholarship Discovery (`src/pages/ScholarshipsPage.tsx`)**:
   - Multi-parameter faceted filtering across Scheme Types (Central, State, Private), Education Levels, Domicile States, Social Categories, Genders, and Application Deadlines in IST.
   - Integrated with keyword search and sorting mechanisms.

3. **Deterministic Eligibility Evaluator (`src/services/eligibilityEngine.ts`)**:
   - Evaluates a student profile against codified scheme criteria.
   - Outputs transparent condition-by-condition verdicts (*Appears eligible*, *Potentially eligible*, *Does not appear eligible*, *Cannot determine*).
   - Operates independently of LLM uncertainty to eliminate hallucinations.

4. **Grounded AI Assistant (`src/services/aiAssistantService.ts`)**:
   - Provider-independent LLM adapter supporting OpenRouter, OpenAI, and Google Gemini with graceful fallback.
   - Strictly grounds prompts using retrieved database records with verified source URLs and timestamped citations.

5. **Student Dashboard & Tracker (`src/pages/DashboardPage.tsx`, `src/pages/ApplicationsPage.tsx`)**:
   - Manages personal application lifecycle stages (*Interested*, *Preparing documents*, *Ready to apply*, *Submitted*, *Under review*, *Approved*, *Rejected*).
   - Manages document readiness checklists.
   - Highlights confirmed application closing dates in Indian Standard Time (IST).

6. **Admin Audit Console (`src/pages/AdminPage.tsx`)**:
   - Role-protected dashboard for reviewing primary sources, verifying scheme updates, and recording system audit logs.
