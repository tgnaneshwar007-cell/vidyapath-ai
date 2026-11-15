import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/locales/LanguageContext';
import { VERIFIED_SCHOLARSHIPS } from '@/data/verifiedScholarships';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
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

  // Preview 3 real verified scholarships
  const previewScholarships = VERIFIED_SCHOLARSHIPS.slice(0, 3);

  return (
    <div className="flex flex-col space-y-16 md:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3.5 py-1 text-xs text-brand-storm-dark font-medium shadow-subtle mb-6">
            <span className="flex h-2 w-2 rounded-full bg-brand-orange" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-black leading-[1.12]">
            {t.hero.headline}
          </h1>

          {/* Supporting Subtitle */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-brand-mutedText leading-relaxed max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link to="/scholarships" className="flex items-center gap-2">
                <span>{t.hero.exploreCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/eligibility">
                {t.hero.eligibilityCta}
              </Link>
            </Button>
          </div>

          {/* Trust Note */}
          <p className="mt-4 text-xs text-brand-mutedText flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-success" />
            <span>{t.hero.guarantee}</span>
          </p>
        </div>

        {/* Interactive Restrained Search Box (Product Preview) */}
        <div className="mt-12 max-w-2xl mx-auto">
          <form 
            onSubmit={handleQuickSearch}
            className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl border border-brand-border bg-brand-surface shadow-card"
          >
            <div className="relative flex-1 w-full flex items-center pl-3">
              <Search className="h-4 w-4 text-brand-storm shrink-0" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="w-full bg-transparent px-3 py-2 text-sm text-brand-black placeholder:text-brand-mutedText focus:outline-none"
              />
            </div>
            <Button type="submit" variant="secondary" size="default" className="w-full sm:w-auto shrink-0">
              {t.common.searchPlaceholder.split(' ')[0] || 'Search'}
            </Button>
          </form>

          {/* Suggested Quick Filter Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-brand-storm-dark">
            <span className="text-brand-mutedText">Popular:</span>
            <button 
              onClick={() => navigate('/scholarships?schemeType=central')}
              className="rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 hover:border-brand-storm transition-colors"
            >
              Central Government
            </button>
            <button 
              onClick={() => navigate('/scholarships?category=SC')}
              className="rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 hover:border-brand-storm transition-colors"
            >
              SC / ST Post-Matric
            </button>
            <button 
              onClick={() => navigate('/scholarships?gender=female')}
              className="rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 hover:border-brand-storm transition-colors"
            >
              Girls Technical (Pragati)
            </button>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 Clear Steps) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="border-t border-brand-border/60 pt-14">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black font-display">
              {t.howItWorks.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-brand-mutedText">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-storm-subtle text-brand-storm-dark font-mono font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-brand-black">
                {t.howItWorks.step1Title}
              </h3>
              <p className="mt-2 text-sm text-brand-mutedText leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>

            <div className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-storm-subtle text-brand-storm-dark font-mono font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-brand-black">
                {t.howItWorks.step2Title}
              </h3>
              <p className="mt-2 text-sm text-brand-mutedText leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>

            <div className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-orange-subtle text-brand-orange font-mono font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-brand-black">
                {t.howItWorks.step3Title}
              </h3>
              <p className="mt-2 text-sm text-brand-mutedText leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERIFIED SCHOLARSHIP PREVIEW */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified Scheme Directory</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-brand-black font-display">
              Featured Opportunities
            </h2>
          </div>

          <Button asChild variant="outline">
            <Link to="/scholarships" className="flex items-center gap-1.5">
              <span>View All Verified Schemes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewScholarships.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      </section>

      {/* 4. MULTILINGUAL AI ASSISTANT DEMO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-brand-storm-subtle px-2.5 py-1 text-xs font-semibold text-brand-storm-dark">
                <Globe2 className="h-3.5 w-3.5 text-brand-orange" />
                <span>English • తెలుగు • हिंदी</span>
              </div>

              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-brand-black font-display">
                {t.assistantIntro.title}
              </h2>

              <p className="mt-3 text-sm sm:text-base text-brand-mutedText leading-relaxed">
                {t.assistantIntro.subtitle}
              </p>

              <div className="mt-6 flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="rounded-lg border border-brand-border/60 bg-brand-storm-subtle/30 p-3 text-brand-storm-dark">
                  "{t.assistantIntro.examplePrompt1}"
                </div>
                <div className="rounded-lg border border-brand-border/60 bg-brand-storm-subtle/30 p-3 text-brand-storm-dark">
                  "{t.assistantIntro.examplePrompt2}"
                </div>
                <div className="rounded-lg border border-brand-border/60 bg-brand-storm-subtle/30 p-3 text-brand-storm-dark">
                  "{t.assistantIntro.examplePrompt3}"
                </div>
              </div>

              <div className="mt-6">
                <Button asChild variant="primary">
                  <Link to="/assistant">
                    {t.assistantIntro.cta}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Visual Chat Preview (Restrained, Real, Clean) */}
            <div className="rounded-xl border border-brand-border bg-brand-warmWhite p-5 text-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand-success" />
                  <span className="font-semibold text-brand-black text-xs font-mono">VidyaPath Grounded Engine</span>
                </div>
                <span className="text-[10px] text-brand-mutedText uppercase font-mono">No Hallucinations</span>
              </div>

              {/* Sample User Bubble */}
              <div className="flex justify-end">
                <div className="rounded-lg bg-brand-black text-white px-3.5 py-2 max-w-[85%] text-xs">
                  What is the income limit for AICTE Pragati Girls scholarship?
                </div>
              </div>

              {/* Sample Assistant Bubble */}
              <div className="flex justify-start">
                <div className="rounded-lg border border-brand-border bg-brand-surface p-3 max-w-[90%] text-xs space-y-2">
                  <p className="text-brand-black leading-relaxed">
                    According to verified AICTE guidelines, the annual family income must be <strong>less than ₹8,00,000 (8 Lakhs)</strong> per annum.
                  </p>
                  <div className="rounded border border-brand-border/70 bg-brand-storm-subtle/40 p-2 text-[11px] text-brand-storm-dark">
                    <span className="font-semibold">Source: </span>
                    <span className="font-mono text-brand-orange">AICTE Pragati Scheme Guidelines, Section 3.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST & VERIFICATION MANIFESTO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black font-display">
            {t.trust.title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-brand-mutedText">
            {t.trust.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <h3 className="font-semibold text-brand-black text-sm">
              {t.trust.item1Title}
            </h3>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item1Desc}
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <h3 className="font-semibold text-brand-black text-sm">
              {t.trust.item2Title}
            </h3>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item2Desc}
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <h3 className="font-semibold text-brand-black text-sm">
              {t.trust.item3Title}
            </h3>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item3Desc}
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-subtle">
            <h3 className="font-semibold text-brand-black text-sm">
              {t.trust.item4Title}
            </h3>
            <p className="mt-2 text-xs text-brand-mutedText leading-relaxed">
              {t.trust.item4Desc}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
