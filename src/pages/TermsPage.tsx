import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div className="border-b border-brand-border pb-6">
        <h1 className="text-3xl font-extrabold text-brand-black font-display">
          Terms & Conditions of Service
        </h1>
        <p className="mt-2 text-xs text-brand-mutedText font-mono">
          Last Updated: November 15, 2026 | Document Status: Production Draft
        </p>
      </div>

      <div className="rounded-lg border border-brand-border bg-brand-storm-subtle/50 p-4 text-xs text-brand-mutedText leading-relaxed flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
        <p>
          <strong>Non-Governmental Entity Notice:</strong> VidyaPath AI is an independent discovery platform. We are not affiliated with, endorsed by, or representing the Ministry of Social Justice and Empowerment, Ministry of Education, or any State Welfare Department.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-brand-storm-dark space-y-6">
        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">1. Nature of the Service</h2>
          <p className="text-sm leading-relaxed mt-2">
            VidyaPath AI provides informational discovery, deterministic eligibility simulations, document readiness checklists, and application milestone tracking. We do not accept official scholarship applications, disburse government scholarship funds, or influence award selections.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">2. No Guarantee of Sanction or Award</h2>
          <p className="text-sm leading-relaxed mt-2">
            Results provided by our Eligibility Evaluator ("Appears eligible", "Potentially eligible") reflect preliminary automated calculations against publicly available guidelines. Official scholarship approval is strictly determined by competent statutory scrutiny officers, educational institutions, and nodal ministries upon manual verification of physical documents.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">3. Accuracy & Verification Timestamp</h2>
          <p className="text-sm leading-relaxed mt-2">
            While VidyaPath AI rigorously maintains verified source links and audit timestamps, government guidelines, quotas, and deadlines are subject to sudden administrative gazette revisions. Students must always review official guidelines on the designated portal (e.g., scholarships.gov.in) prior to submitting applications.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black font-display">4. Permitted Use</h2>
          <p className="text-sm leading-relaxed mt-2">
            You agree to use this platform solely for legitimate academic and scholarship discovery. Automated scraping, reverse engineering of backend intelligence adapters, or redistribution of scholarship records for commercial fee extraction is strictly prohibited.
          </p>
        </section>
      </div>
    </div>
  );
};
