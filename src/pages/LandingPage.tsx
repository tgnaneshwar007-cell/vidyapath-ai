import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/locales/LanguageContext';
import { VERIFIED_SCHOLARSHIPS } from '@/data/verifiedScholarships';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Globe2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/scholarships?search=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate('/scholarships');
    }
  };

  // Preview top 3 verified scholarships
  const previewScholarships = VERIFIED_SCHOLARSHIPS.slice(0, 3);

  return (
    <div className="flex flex-col space-y-16 md:space-y-24 pb-20 overflow-x-hidden">
      {/* 1. HERO SECTION - Crisp, Uncluttered, Editorial */}
      <section className="relative pt-10 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto">
          {/* Subtle Verified Indicator Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-white/80 backdrop-blur-md px-3.5 py-1 text-xs text-brand-storm-dark font-medium shadow-subtle mb-5">
            <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            <span>Official & Verified Indian Scholarships Directory</span>
          </div>

          {/* Main Headline in Times New Roman Serif */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-brand-black leading-[1.12]">
            Find scholarships that fit your future.
          </h1>

          {/* Concise, Refined Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-brand-mutedText leading-relaxed max-w-xl mx-auto font-sans">
            Explore verified government and foundation scholarships in English, Telugu, or Hindi with zero speculative deadlines.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button asChild variant="primary" size="lg" className="tap-60fps w-full sm:w-auto shadow-subtle">
              <Link to="/scholarships" className="flex items-center gap-2">
                <span>Explore Scholarships</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="tap-60fps w-full sm:w-auto">
              <Link to="/eligibility">
                Check My Eligibility
              </Link>
            </Button>
          </div>
        </div>

        {/* 2. FROSTED GLASS SEARCH PANEL (Pixel-calibrated) */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form 
            onSubmit={handleQuickSearch}
            className="glass-panel tap-60fps flex flex-col sm:flex-row items-center gap-2 p-2 sm:p-2.5 rounded-2xl"
          >
            <div className="relative flex-1 w-full flex items-center pl-3">
              <Search className="h-4 w-4 text-brand-storm shrink-0" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search by scholarship, state, course, or category..."
                className="w-full bg-transparent px-3 py-2 text-sm text-brand-black placeholder:text-brand-mutedText/80 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="secondary" size="default" className="tap-60fps w-full sm:w-auto shrink-0">
              Search
            </Button>
          </form>

          {/* Clean Quick Filter Pills */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-brand-storm-dark">
            <span className="text-brand-mutedText font-medium">Quick links:</span>
            <button 
              onClick={() => navigate('/scholarships?schemeType=central')}
              className="tap-60fps rounded-full border border-brand-border/80 bg-white/70 px-3 py-1 hover:border-brand-storm transition-colors"
            >
              Central Government
            </button>
            <button 
              onClick={() => navigate('/scholarships?category=SC')}
              className="tap-60fps rounded-full border border-brand-border/80 bg-white/70 px-3 py-1 hover:border-brand-storm transition-colors"
            >
              SC / ST Post-Matric
            </button>
            <button 
              onClick={() => navigate('/scholarships?gender=female')}
              className="tap-60fps rounded-full border border-brand-border/80 bg-white/70 px-3 py-1 hover:border-brand-storm transition-colors"
            >
              Girls Technical (Pragati)
            </button>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS - 3 Clear Steps with Refined Whitespace */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="border-t border-brand-border/50 pt-12">
          <div className="text-center max-w-xl mx-auto mb-9">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-brand-black">
              {t.howItWorks.title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-brand-mutedText">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            <div className="tap-60fps rounded-xl border border-brand-border bg-brand-surface p-6 shadow-subtle hover:border-brand-storm transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-storm-subtle text-brand-storm-dark font-mono font-bold text-xs mb-3.5">
                01
              </div>
              <h3 className="text-base font-serif font-bold text-brand-black">
                {t.howItWorks.step1Title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-brand-mutedText leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>

            <div className="tap-60fps rounded-xl border border-brand-border bg-brand-surface p-6 shadow-subtle hover:border-brand-storm transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-storm-subtle text-brand-storm-dark font-mono font-bold text-xs mb-3.5">
                02
              </div>
              <h3 className="text-base font-serif font-bold text-brand-black">
                {t.howItWorks.step2Title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-brand-mutedText leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>

            <div className="tap-60fps rounded-xl border border-brand-border bg-brand-surface p-6 shadow-subtle hover:border-brand-storm transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orange-subtle text-brand-orange font-mono font-bold text-xs mb-3.5">
                03
              </div>
              <h3 className="text-base font-serif font-bold text-brand-black">
                {t.howItWorks.step3Title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-brand-mutedText leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VERIFIED SCHOLARSHIP PREVIEW - Frosted Glassmorphism Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-orange font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified Scheme Directory</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-brand-black">
              Featured Opportunities
            </h2>
          </div>

          <Button asChild variant="outline" size="sm" className="tap-60fps">
            <Link to="/scholarships" className="flex items-center gap-1.5">
              <span>View All Verified Schemes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {previewScholarships.map((scholarship) => (
            <ScholarshipCard 
              key={scholarship.id} 
              scholarship={scholarship} 
              glassmorphic={true}
            />
          ))}
        </div>
      </section>

      {/* 5. MULTILINGUAL AI ASSISTANT DEMO - Glassmorphism Showcase */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="glass-panel rounded-2xl p-6 sm:p-10 shadow-glass">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-storm-dark border border-brand-border/60 shadow-subtle">
                <Globe2 className="h-3.5 w-3.5 text-brand-orange" />
                <span>English • తెలుగు • हिंदी</span>
              </div>

              <h2 className="mt-3.5 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-brand-black leading-snug">
                {t.assistantIntro.title}
              </h2>

              <p className="mt-2.5 text-xs sm:text-sm text-brand-mutedText leading-relaxed">
                {t.assistantIntro.subtitle}
              </p>

              <div className="mt-5 flex flex-col gap-2 text-xs">
                <div className="tap-60fps rounded-lg border border-brand-border/60 bg-white/70 p-3 text-brand-storm-dark">
                  "{t.assistantIntro.examplePrompt1}"
                </div>
                <div className="tap-60fps rounded-lg border border-brand-border/60 bg-white/70 p-3 text-brand-storm-dark">
                  "{t.assistantIntro.examplePrompt2}"
                </div>
                <div className="tap-60fps rounded-lg border border-brand-border/60 bg-white/70 p-3 text-brand-storm-dark">
                  "{t.assistantIntro.examplePrompt3}"
                </div>
              </div>

              <div className="mt-6">
                <Button asChild variant="primary" className="tap-60fps">
                  <Link to="/assistant">
                    {t.assistantIntro.cta}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Visual Chat Preview */}
            <div className="rounded-xl border border-brand-border/80 bg-white/80 backdrop-blur-md p-5 text-sm space-y-4 shadow-subtle">
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand-success" />
                  <span className="font-semibold text-brand-black text-xs font-mono">VidyaPath Grounded Engine</span>
                </div>
                <span className="text-[10px] text-brand-mutedText uppercase font-mono">No Hallucinations</span>
              </div>

              {/* Sample User Bubble */}
              <div className="flex justify-end">
                <div className="rounded-lg bg-brand-black text-white px-3.5 py-2 max-w-[85%] text-xs shadow-subtle">
                  What is the family income limit for AICTE Pragati Girls scholarship?
                </div>
              </div>

              {/* Sample Assistant Bubble */}
              <div className="flex justify-start">
                <div className="rounded-lg border border-brand-border/80 bg-white p-3.5 max-w-[90%] text-xs space-y-2 shadow-subtle">
                  <p className="text-brand-black leading-relaxed">
                    According to verified AICTE guidelines, the total annual family income must be <strong>less than ₹8,00,000 (8 Lakhs)</strong> per annum.
                  </p>
                  <div className="rounded border border-brand-border/70 bg-brand-storm-subtle/40 p-2 text-[11px] text-brand-storm-dark font-mono">
                    <span className="font-semibold">Source: </span>
                    <span className="text-brand-orange">AICTE Pragati Scheme Guidelines, Section 3.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & VERIFICATION MANIFESTO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-brand-black">
            {t.trust.title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-brand-mutedText">
            {t.trust.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="tap-60fps rounded-xl border border-brand-border bg-brand-surface p-5 shadow-subtle hover:border-brand-storm transition-all">
            <h3 className="font-serif font-bold text-brand-black text-sm">
              {t.trust.item1Title}
            </h3>
            <p className="mt-1.5 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item1Desc}
            </p>
          </div>

          <div className="tap-60fps rounded-xl border border-brand-border bg-brand-surface p-5 shadow-subtle hover:border-brand-storm transition-all">
            <h3 className="font-serif font-bold text-brand-black text-sm">
              {t.trust.item2Title}
            </h3>
            <p className="mt-1.5 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item2Desc}
            </p>
          </div>

          <div className="tap-60fps rounded-xl border border-brand-border bg-brand-surface p-5 shadow-subtle hover:border-brand-storm transition-all">
            <h3 className="font-serif font-bold text-brand-black text-sm">
              {t.trust.item3Title}
            </h3>
            <p className="mt-1.5 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item3Desc}
            </p>
          </div>

          <div className="tap-60fps rounded-xl border border-brand-border bg-brand-surface p-5 shadow-subtle hover:border-brand-storm transition-all">
            <h3 className="font-serif font-bold text-brand-black text-sm">
              {t.trust.item4Title}
            </h3>
            <p className="mt-1.5 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item4Desc}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
