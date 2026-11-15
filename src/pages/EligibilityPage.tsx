import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  StudentEligibilityProfile, 
  EducationLevel, 
  EligibilityEvaluationReport, 
  Scholarship 
} from '@/types';
import { EligibilityEngine } from '@/services/eligibilityEngine';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { useTranslation } from '@/locales/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert
} from 'lucide-react';

export const EligibilityPage: React.FC = () => {
  const { t, language } = useTranslation();
  const availableStates = ScholarshipRepository.getAvailableStates();

  const [formData, setFormData] = useState<StudentEligibilityProfile>({
    state: 'Andhra Pradesh',
    education_level: 'undergraduate',
    course: 'B.Tech / Degree',
    family_income: 180000,
    category: 'OBC',
    gender: 'female',
    previous_marks_percentage: 75,
  });

  const [evaluated, setEvaluated] = useState(false);
  const [results, setResults] = useState<{
    eligible: { scholarship: Scholarship; report: EligibilityEvaluationReport }[];
    potential: { scholarship: Scholarship; report: EligibilityEvaluationReport }[];
    ineligible: { scholarship: Scholarship; report: EligibilityEvaluationReport }[];
  }>({ eligible: [], potential: [], ineligible: [] });

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluation = EligibilityEngine.evaluateAllScholarships(formData, language);
    setResults(evaluation);
    setEvaluated(true);
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'appears_eligible':
        return <Badge variant="verified">{t.common.appearsEligible}</Badge>;
      case 'potentially_eligible':
        return <Badge variant="warning">{t.common.potentiallyEligible}</Badge>;
      case 'not_eligible':
        return <Badge variant="danger">{t.common.notEligible}</Badge>;
      default:
        return <Badge variant="default">{t.common.cannotDetermine}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="border-b border-brand-border pb-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-storm-dark font-medium shadow-subtle mb-3">
          <Sparkles className="h-3 w-3 text-brand-orange" />
          <span>Deterministic Eligibility Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-brand-black font-display">
          {t.eligibility.title}
        </h1>
        <p className="mt-2 text-sm text-brand-mutedText">
          {t.eligibility.subtitle}
        </p>
      </div>

      {/* Input Form */}
      <div className="mt-8 rounded-xl border border-brand-border bg-brand-surface p-6 sm:p-8 shadow-card">
        <form onSubmit={handleEvaluate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Domicile State */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                {t.eligibility.stateLabel}
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none focus:border-brand-storm"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                {t.eligibility.levelLabel}
              </label>
              <select
                value={formData.education_level}
                onChange={(e) => setFormData({ ...formData, education_level: e.target.value as EducationLevel })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none focus:border-brand-storm"
              >
                <option value="class_9_10">Class 9 - 10</option>
                <option value="class_11_12">Class 11 - 12 (Intermediate)</option>
                <option value="diploma">Diploma / Polytechnic</option>
                <option value="undergraduate">Undergraduate Degree (B.Tech, B.Sc, etc.)</option>
                <option value="postgraduate">Postgraduate (M.Tech, M.Sc, etc.)</option>
                <option value="phd">PhD / Research</option>
              </select>
            </div>

            {/* Course Stream */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                {t.eligibility.courseLabel}
              </label>
              <Input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="e.g. Engineering, Commerce, Arts"
              />
            </div>

            {/* Family Income */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                {t.eligibility.incomeLabel}
              </label>
              <Input
                type="number"
                value={formData.family_income}
                onChange={(e) => setFormData({ ...formData, family_income: Number(e.target.value) })}
                placeholder="e.g. 180000"
                min={0}
                step={10000}
              />
              <span className="text-[11px] text-brand-mutedText mt-1 block">
                ₹{formData.family_income ? formData.family_income.toLocaleString('en-IN') : '0'} per year
              </span>
            </div>

            {/* Social Category */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                {t.eligibility.categoryLabel}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none focus:border-brand-storm"
              >
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="Minority">Minority (Muslim, Christian, etc.)</option>
                <option value="General">General Category</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                {t.eligibility.genderLabel}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none focus:border-brand-storm"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="transgender">Transgender</option>
              </select>
            </div>

            {/* Academic Marks */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                {t.eligibility.marksLabel}
              </label>
              <Input
                type="number"
                value={formData.previous_marks_percentage || ''}
                onChange={(e) => setFormData({ ...formData, previous_marks_percentage: Number(e.target.value) })}
                placeholder="e.g. 75"
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end">
            <Button type="submit" variant="primary" size="lg">
              {t.eligibility.calculateBtn}
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {evaluated && (
        <div className="mt-12 space-y-8 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-black font-display">
              {t.eligibility.resultsTitle}
            </h2>
            <span className="text-xs text-brand-mutedText font-mono">
              {results.eligible.length} Matched | {results.potential.length} Potential
            </span>
          </div>

          {/* Statutory Disclaimer Alert */}
          <div className="rounded-lg border border-brand-border bg-brand-storm-subtle/50 p-4 text-xs text-brand-mutedText leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-brand-storm shrink-0 mt-0.5" />
            <p>{t.eligibility.resultsDisclaimer}</p>
          </div>

          {/* 1. Appears Eligible Section */}
          {results.eligible.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-brand-black flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-brand-success" />
                <span>Schemes Where You Appear Eligible ({results.eligible.length})</span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {results.eligible.map(({ scholarship, report }) => (
                  <div key={scholarship.id} className="rounded-lg border border-emerald-200 bg-brand-surface p-5 shadow-subtle">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {getVerdictBadge(report.verdict)}
                          <span className="text-xs text-brand-mutedText">
                            {scholarship.provider.en}
                          </span>
                        </div>
                        <h4 className="mt-1 text-base font-semibold text-brand-black">
                          {scholarship.title[language] || scholarship.title.en}
                        </h4>
                      </div>

                      <Button asChild variant="outline" size="sm" className="self-start sm:self-center">
                        <Link to={`/scholarships/${scholarship.slug}`}>
                          <span>View Scheme</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>

                    <p className="mt-2 text-xs text-brand-storm-dark">
                      {report.summary}
                    </p>

                    {/* Condition Breakdown Accordion */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-brand-border/50">
                      {report.conditions.map((c) => (
                        <div key={c.condition_id} className="flex items-center justify-between p-2 rounded bg-brand-storm-subtle/40">
                          <span className="font-medium text-brand-black">{c.title}</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-brand-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Satisfied
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Potentially Eligible Section */}
          {results.potential.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-brand-black flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-brand-warning" />
                <span>Potentially Eligible - Additional Information Needed ({results.potential.length})</span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {results.potential.map(({ scholarship, report }) => (
                  <div key={scholarship.id} className="rounded-lg border border-amber-200 bg-brand-surface p-5 shadow-subtle">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {getVerdictBadge(report.verdict)}
                          <span className="text-xs text-brand-mutedText">
                            {scholarship.provider.en}
                          </span>
                        </div>
                        <h4 className="mt-1 text-base font-semibold text-brand-black">
                          {scholarship.title[language] || scholarship.title.en}
                        </h4>
                      </div>

                      <Button asChild variant="outline" size="sm" className="self-start sm:self-center">
                        <Link to={`/scholarships/${scholarship.slug}`}>
                          <span>View Requirements</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>

                    <p className="mt-2 text-xs text-brand-storm-dark">
                      {report.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
