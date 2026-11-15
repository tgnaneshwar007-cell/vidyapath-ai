import React from 'react';
import { ShieldCheck, BookOpen, Globe2, CheckCircle2, Lock } from 'lucide-react';

export const AboutPage: React.FC = () => {

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-storm-dark font-medium shadow-subtle mb-3">
          <BookOpen className="h-3 w-3 text-brand-orange" />
          <span>Product Manifesto & Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-black font-display tracking-tight">
          About VidyaPath AI
        </h1>
        <p className="mt-3 text-base text-brand-mutedText leading-relaxed">
          "Find the support that moves you forward."
        </p>
      </div>

      {/* Mission */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-6 sm:p-8 shadow-card space-y-4">
        <h2 className="text-xl font-bold text-brand-black font-display">
          Our Purpose
        </h2>
        <p className="text-sm sm:text-base text-brand-storm-dark leading-relaxed">
          Every academic year, thousands of deserving Indian students fail to access statutory scholarships simply because official schemes are buried under fragmented ministry portals, written in complex legal language, or surrounded by misinformation.
        </p>
        <p className="text-sm sm:text-base text-brand-storm-dark leading-relaxed">
          VidyaPath AI was engineered to bridge this divide. We provide an independent, multilingual scholarship discovery and application assistance platform designed with high editorial precision, deterministic rule verification, and clear regional language guidance across English, Telugu, and Hindi.
        </p>
      </div>

      {/* Verification Methodology */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-brand-black font-display">
          Our Four Pillars of Truth
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <div className="flex items-center gap-2 font-semibold text-brand-black text-sm">
              <ShieldCheck className="h-4 w-4 text-brand-success" />
              <span>Direct Ministry Sourcing</span>
            </div>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              Every scheme entry is linked to primary official sources: the National Scholarship Portal, state government welfare departments, or verified philanthropic charters. We never cite secondary blogs or rumor boards.
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <div className="flex items-center gap-2 font-semibold text-brand-black text-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-orange" />
              <span>Deterministic Eligibility Engine</span>
            </div>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              Eligibility logic is computed strictly using codified statutory rules (income caps, domicile, and academic cutoffs). We do not delegate rule interpretation to unpredictable generative AI.
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <div className="flex items-center gap-2 font-semibold text-brand-black text-sm">
              <Globe2 className="h-4 w-4 text-brand-storm" />
              <span>Native Multilingual Precision</span>
            </div>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              Interface and official requirements are rendered natively in English, Telugu (తెలుగు), and Hindi (हिंदी). Students can understand document prerequisites in their native language without translation distortion.
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <div className="flex items-center gap-2 font-semibold text-brand-black text-sm">
              <Lock className="h-4 w-4 text-brand-black" />
              <span>Zero Intermediary Exploitation</span>
            </div>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              VidyaPath AI is completely free for students. We collect no application commissions, sell no student data, and never request sensitive banking details or Aadhaar biometric tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
