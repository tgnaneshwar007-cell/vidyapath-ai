# VidyaPath AI - Security & Privacy Architecture

## 1. Threat Model & Protections

### A. Non-Intermediary Guarantee
- VidyaPath AI never acts as a financial intermediary. We do not collect bank account credentials, credit/debit card numbers, UPI IDs, or Aadhaar authentication tokens.
- All application transactions occur directly on official government or authorized foundation portals (e.g., `scholarships.gov.in`, `jnanabhumi.ap.gov.in`).

### B. Prevention of AI Hallucinations
- The LLM assistant is constrained through a Retrieval-Augmented Generation (RAG) pipeline.
- The assistant is forbidden from creating arbitrary eligibility rules, inventing deadlines, or impersonating government officials.
- When verified information is insufficient, the assistant explicitly reports that additional information is required.

### C. Server-Side Keys & API Security
- AI provider secrets (`VITE_OPENROUTER_API_KEY`, `VITE_OPENAI_API_KEY`, `VITE_GEMINI_API_KEY`) and Supabase service keys are never bundled into client-exposed builds in production.
- Production deployments route AI completions through secure serverless Edge Functions.

### D. Data Retention & User Purge
- Students have the statutory right to immediately delete all personal data.
- The "Purge Local Data" action instantly erases all local bookmarks, profile entries, and application trackers.
- Database cascade deletes guarantee that deleting a profile record deletes all associated tracking and notification data.
