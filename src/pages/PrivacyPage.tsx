import React from 'react';
import { AlertCircle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div className="border-b border-brand-border pb-6">
        <h1 className="text-3xl font-extrabold text-brand-black font-display">
          Privacy Policy (Draft for Project Owner Review)
        </h1>
        <p className="mt-2 text-xs text-brand-mutedText font-mono">
          Last Updated: November 15, 2026 | Document Status: Production Draft
        </p>
      </div>

      <div className="rounded-lg border border-brand-border bg-brand-storm-subtle/50 p-4 text-xs text-brand-mutedText leading-relaxed flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-brand-storm shrink-0 mt-0.5" />
        <p>
          <strong>Owner Notice:</strong> This privacy policy is formulated as an honest, privacy-first technical statement of current application practices. The project owner must review and tailor contact particulars and legal entity specifics prior to commercial deployment.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-brand-storm-dark space-y-6">
        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed mt-2">
            VidyaPath AI follows a strict data minimization architecture. Guests can browse scholarships, run eligibility calculations, and ask questions without creating an account or providing personally identifiable information.
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
            <li><strong>Voluntary Academic Profile Data:</strong> State of domicile, education level, current course stream, self-reported annual income bracket, social category, and gender when input by you into the Eligibility Evaluator or Student Profile.</li>
            <li><strong>Application Management Data:</strong> User-selected stage tracking labels, checklist readiness states, and personal notes.</li>
            <li><strong>AI Interaction Logs:</strong> Anonymous query text sent to the AI assistant for retrieving grounded scheme answers.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">2. Information We Never Collect</h2>
          <p className="text-sm leading-relaxed mt-2">
            To protect Indian students from fraudulent exploitation:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
            <li>We do NOT collect, scan, or store Aadhaar numbers, biometric fingerprints, or IRIS scans.</li>
            <li>We do NOT collect bank account numbers, IFSC codes, debit card details, or UPI PINs.</li>
            <li>We do NOT charge application fees or request payment card credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">3. Grounded AI Usage Disclosure</h2>
          <p className="text-sm leading-relaxed mt-2">
            Our AI assistant operates on a Retrieval-Augmented Generation (RAG) architecture. When you submit a question, our backend retrieves excerpts from verified government scholarship records and supplies them as ground truth to the model adapter. AI responses are generated solely for informational assistance and never represent official government eligibility determinations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">4. Data Retention & Instant User Purge</h2>
          <p className="text-sm leading-relaxed mt-2">
            You retain absolute ownership of your data. You may purge all local bookmarks, application progress records, and profile particulars at any time by clicking the "Purge Local Data" button located on the Profile page. When remote Supabase authentication is active, account deletion automatically triggers an immediate cascade delete of all associated records.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">5. Contact Information</h2>
          <div className="rounded-lg border border-brand-border bg-brand-surface p-4 text-xs font-mono space-y-1">
            <p className="font-semibold text-brand-black">Platform Owner & Privacy Desk:</p>
            <p>VidyaPath AI Project Office: [CONFIGURE_OWNER_LEGAL_ENTITY]</p>
            <p>Official Contact Email: privacy@vidyapath.ai (or owner configured email)</p>
            <p>Operational Jurisdiction: India</p>
          </div>
        </section>
      </div>
    </div>
  );
};
