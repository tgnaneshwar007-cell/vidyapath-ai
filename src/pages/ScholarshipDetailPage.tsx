import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Scholarship } from '@/types';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { useTranslation } from '@/locales/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  FileText, 
  ListOrdered, 
  AlertCircle, 
  ArrowLeft, 
  Share2 
} from 'lucide-react';

export const ScholarshipDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useTranslation();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      ScholarshipRepository.getScholarshipBySlug(slug).then((res) => {
        setScholarship(res);
        if (res) {
          setIsSaved(ScholarshipRepository.isScholarshipSaved(res.id));
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-brand-mutedText">
        {t.common.loading}
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-brand-black">Scholarship Not Found</h2>
        <p className="mt-2 text-sm text-brand-mutedText">
          The requested scholarship record could not be found or has been archived.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/scholarships">Back to Scholarship Directory</Link>
        </Button>
      </div>
    );
  }

  const title = scholarship.title[language] || scholarship.title.en;
  const provider = scholarship.provider[language] || scholarship.provider.en;
  const description = scholarship.description[language] || scholarship.description.en;
  const benefits = scholarship.benefits[language] || scholarship.benefits.en;
  const instructions = scholarship.application_instructions[language] || scholarship.application_instructions.en || [];

  const handleToggleSave = () => {
    const updated = ScholarshipRepository.toggleSaveScholarship(scholarship.id);
    setIsSaved(updated);
  };

  const handleStartTracking = () => {
    ScholarshipRepository.trackScholarship(scholarship, 'preparing_documents');
    navigate('/applications');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-mutedText hover:text-brand-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Scholarships</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-6 sm:p-8 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={scholarship.scheme_type === 'central' ? 'central' : scholarship.scheme_type === 'state' ? 'state' : 'private'}>
              {scholarship.scheme_type === 'central' ? t.common.centralGov : scholarship.scheme_type === 'state' ? t.common.stateGov : t.common.privateScheme}
            </Badge>
            <Badge variant="verified" className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>{t.common.verifiedScheme}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-black hover:bg-brand-storm-subtle"
              title="Copy link to clipboard"
            >
              <Share2 className="h-3.5 w-3.5 text-brand-storm" />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleToggleSave}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-black hover:bg-brand-storm-subtle"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5 text-brand-orange" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5 text-brand-storm" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title & Provider */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-brand-black font-display leading-tight">
          {title}
        </h1>

        <div className="mt-2 flex items-center gap-2 text-sm text-brand-mutedText">
          <Building2 className="h-4 w-4 shrink-0 text-brand-storm" />
          <span>{provider}</span>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-brand-storm-dark leading-relaxed">
          {description}
        </p>

        {/* Essential Quick Matrix */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-brand-border/60 pt-6">
          <div className="rounded-lg bg-brand-storm-subtle/50 p-4 border border-brand-border/40">
            <span className="text-xs uppercase font-mono text-brand-mutedText font-semibold">Award Benefits</span>
            <div className="mt-1 text-sm font-semibold text-brand-black">
              {scholarship.award_amount ? `Up to ₹${scholarship.award_amount.toLocaleString('en-IN')}/year` : 'Full Tuition & Maintenance'}
            </div>
            <p className="text-xs text-brand-mutedText mt-1 line-clamp-2">{benefits}</p>
          </div>

          <div className="rounded-lg bg-brand-storm-subtle/50 p-4 border border-brand-border/40">
            <span className="text-xs uppercase font-mono text-brand-mutedText font-semibold">Confirmed Deadline</span>
            <div className="mt-1 text-sm font-semibold text-brand-black flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-orange" />
              <span>
                {scholarship.closing_date 
                  ? new Date(scholarship.closing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : t.common.noDeadlineProvided}
              </span>
            </div>
            <span className="text-[11px] text-brand-mutedText mt-1 block">
              Last verified: {scholarship.last_verified_at}
            </span>
          </div>

          <div className="rounded-lg bg-brand-storm-subtle/50 p-4 border border-brand-border/40">
            <span className="text-xs uppercase font-mono text-brand-mutedText font-semibold">Income Ceiling</span>
            <div className="mt-1 text-sm font-semibold text-brand-black">
              {scholarship.income_limit ? `≤ ₹${scholarship.income_limit.toLocaleString('en-IN')} / year` : 'No Mandatory Limit'}
            </div>
            <span className="text-[11px] text-brand-mutedText mt-1 block">
              Applicable: {scholarship.applicable_categories.join(', ')}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
            <a
              href={scholarship.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <span>{t.common.applyNow}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <Button 
            onClick={handleStartTracking}
            variant="secondary" 
            size="lg" 
            className="w-full sm:w-auto"
          >
            Track in My Applications
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to={`/eligibility`}>
              Evaluate My Eligibility
            </Link>
          </Button>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Eligibility Conditions & Instructions (2 Cols) */}
        <div className="md:col-span-2 space-y-8">
          {/* Eligibility Conditions */}
          <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card">
            <div className="flex items-center gap-2 text-base font-semibold text-brand-black pb-3 border-b border-brand-border">
              <CheckCircle2 className="h-5 w-5 text-brand-success" />
              <span>Official Eligibility Requirements</span>
            </div>

            <ul className="mt-4 space-y-3">
              {scholarship.eligibility_conditions.map((cond) => (
                <li key={cond.id} className="flex items-start gap-3 text-sm text-brand-storm-dark">
                  <div className="mt-1 h-2 w-2 rounded-full bg-brand-orange shrink-0" />
                  <div>
                    <span className="text-brand-black font-medium">
                      {cond.description[language] || cond.description.en}
                    </span>
                    {cond.is_mandatory && (
                      <span className="ml-2 text-[10px] font-mono uppercase bg-brand-storm-subtle text-brand-storm-dark px-1.5 py-0.5 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Required Documents */}
          <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card">
            <div className="flex items-center gap-2 text-base font-semibold text-brand-black pb-3 border-b border-brand-border">
              <FileText className="h-5 w-5 text-brand-orange" />
              <span>Mandatory Documentation Checklist</span>
            </div>

            <div className="mt-4 space-y-3">
              {scholarship.required_documents.map((doc, idx) => (
                <div key={doc.id} className="rounded-lg border border-brand-border/60 bg-brand-warmWhite/60 p-3.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand-black">
                      {idx + 1}. {doc.name[language] || doc.name.en}
                    </span>
                    <Badge variant="outline" className="text-[10px]">Official Requirement</Badge>
                  </div>
                  {doc.description && (
                    <p className="mt-1 text-xs text-brand-mutedText">
                      {doc.description[language] || doc.description.en}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Application Steps */}
          {instructions.length > 0 && (
            <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card">
              <div className="flex items-center gap-2 text-base font-semibold text-brand-black pb-3 border-b border-brand-border">
                <ListOrdered className="h-5 w-5 text-brand-storm" />
                <span>How to Apply (Step-by-Step)</span>
              </div>

              <ol className="mt-4 space-y-3">
                {instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-brand-storm-dark">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-black text-white text-xs font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5 text-brand-black">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Right Sidebar: Sources, Verification & Official Contacts */}
        <aside className="space-y-6">
          {/* Verification & Sourcing Box */}
          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-card">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-black font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-success" />
              <span>Verification Audit</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs text-brand-storm-dark">
              <div>
                <span className="text-brand-mutedText">Last Verified:</span>
                <p className="font-medium text-brand-black">{scholarship.last_verified_at}</p>
              </div>

              <div>
                <span className="text-brand-mutedText">Confidence Status:</span>
                <p className="font-semibold text-brand-success">100% Confirmed Official Record</p>
              </div>

              <div>
                <span className="text-brand-mutedText">Referenced Primary Sources:</span>
                <ul className="mt-1.5 space-y-2">
                  {scholarship.sources.map((src) => (
                    <li key={src.id} className="rounded bg-brand-storm-subtle/50 p-2 border border-brand-border/40">
                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-orange hover:underline font-medium flex items-center gap-1"
                      >
                        <span className="line-clamp-1">{src.source_name}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      {src.verification_notes && (
                        <p className="text-[10px] text-brand-mutedText mt-1">
                          {src.verification_notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Direct Government Advisory Note */}
          <div className="rounded-xl border border-brand-border/80 bg-brand-storm-subtle/40 p-5 text-xs text-brand-mutedText leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-brand-black mb-1.5">
              <AlertCircle className="h-4 w-4 text-brand-orange" />
              <span>Student Notice</span>
            </div>
            <p>
              Never pay any fees to agents or third parties. Government and official foundation scholarships are processed without registration charges.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
