# VidyaPath AI (విద్యాపథ్ AI / विद्यापथ AI)

> *"Find the support that moves you forward."*

VidyaPath AI is a premium, multilingual Indian scholarship discovery and application assistance platform. Built for students across India, it provides verified scholarship schemes, deterministic eligibility evaluations, document readiness checklists, and grounded AI guidance in English, Telugu, and Hindi.

---

## Key Features

1. **Verified Indian Scholarship Directory**:
   - Comprehensive records from the National Scholarship Portal (NSP), Ministry of Social Justice & Empowerment, AICTE, state portals (Andhra Pradesh Jnanabhumi, Telangana ePASS), and verified philanthropic foundations (Reliance Foundation).
   - Real confirmed application deadlines in Indian Standard Time (IST). Zero speculative countdowns.

2. **Deterministic Eligibility Engine**:
   - Compares student domicile, educational stream, social category, and family income against published statutory rules.
   - Provides transparent, condition-by-condition verdicts (*Appears eligible*, *Potentially eligible*, *Not eligible*) without generative hallucination.

3. **Multilingual Architecture**:
   - Full native localization across **English**, **Telugu (తెలుగు)**, and **Hindi (हिंदी)**.
   - Dynamic real-time language switching across UI elements, scheme taxonomies, and assistant responses.

4. **Grounded RAG AI Assistant**:
   - Answers student queries strictly using retrieved verified database records.
   - Features clickable source citation pills linking to official ministry guidelines.

5. **Application Lifecycle Tracker & Document Checklist**:
   - User-managed stage tracking (*Interested*, *Preparing documents*, *Ready to apply*, *Submitted*, *Under review*, *Approved*).
   - Interactive document readiness checklists for Income Certificates, Caste Proofs, and Bonafides.

6. **Distinguished 60/30/10 Design System**:
   - **Storm Grey (60%)**, **Matte Black (30%)**, and **Safety Orange (10%)**.
   - Solid, accessible surfaces adhering to WCAG 2.2 AA contrast standards. No purple gradients or distracting decorative glassmorphism.

---

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6
- **UI & Icons**: Radix UI Primitives, Lucide React
- **Data & Testing**: Vitest, TanStack Query, React Hook Form, Zod
- **Backend & Database**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **AI Engine**: Provider-agnostic adapter supporting OpenRouter, OpenAI, and Google Gemini with grounded deterministic fallback

---

## Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/vidyapath-ai.git
cd vidyapath-ai

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The application works immediately in offline/mock verified mode without requiring external credentials).*

### 4. Running the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Running Tests & Production Build
```bash
# Run unit & integration tests
npm test

# Production build
npm run build
```

---

## Verification & Trust Manifesto
VidyaPath AI is an independent discovery platform designed for students. We do not charge application fees, do not collect banking credentials or Aadhaar biometric tokens, and direct all applications to official government and verified foundation portals.
