import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VERIFIED_SCHOLARSHIPS } from '@/data/verifiedScholarships';
import { useTranslation } from '@/locales/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Square, 
  AlertCircle, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { language } = useTranslation();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(VERIFIED_SCHOLARSHIPS[0].id);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const selectedScheme = VERIFIED_SCHOLARSHIPS.find((s) => s.id === selectedSchemeId) || VERIFIED_SCHOLARSHIPS[0];

  const handleToggleDoc = (docId: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-brand-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black font-display">
          Official Document Checklist
        </h1>
        <p className="mt-1 text-sm text-brand-mutedText">
          Review mandatory certificates and eligibility documentation specified by scholarship sanctioning bodies.
        </p>
      </div>

      {/* Safety & Compliance Notice */}
      <div className="rounded-lg border border-brand-border bg-brand-storm-subtle/50 p-4 text-xs text-brand-mutedText flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-brand-storm shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Standard:</strong> VidyaPath AI does not request or store your sensitive identity cards (Aadhaar, PAN, Bank Passbooks). This interactive checklist is for your personal readiness verification prior to applying on the official government portal.
        </p>
      </div>

      {/* Scheme Selection Pills */}
      <div>
        <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
          Select Scholarship Scheme:
        </label>
        <div className="flex flex-wrap gap-2">
          {VERIFIED_SCHOLARSHIPS.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => setSelectedSchemeId(scheme.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                selectedSchemeId === scheme.id
                  ? 'bg-brand-black text-white font-semibold'
                  : 'border border-brand-border bg-brand-surface text-brand-black hover:border-brand-storm'
              }`}
            >
              {scheme.title[language] || scheme.title.en}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Card */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-border">
          <div>
            <span className="text-xs font-mono uppercase text-brand-orange font-semibold">
              Official Document Guidelines
            </span>
            <h2 className="text-lg font-bold text-brand-black">
              {selectedScheme.title[language] || selectedScheme.title.en}
            </h2>
            <p className="text-xs text-brand-mutedText">
              {selectedScheme.provider[language] || selectedScheme.provider.en}
            </p>
          </div>

          <a
            href={selectedScheme.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-black hover:bg-brand-storm-subtle self-start sm:self-center"
          >
            <span>Verify on Official Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Documents Checklist List */}
        <div className="space-y-3">
          {selectedScheme.required_documents.map((doc, idx) => {
            const isChecked = !!checkedMap[`${selectedScheme.id}_${doc.id}`];

            return (
              <div
                key={doc.id}
                onClick={() => handleToggleDoc(`${selectedScheme.id}_${doc.id}`)}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  isChecked
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                    : 'border-brand-border bg-brand-warmWhite/40 hover:border-brand-storm text-brand-black'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="h-5 w-5 text-brand-success" />
                  ) : (
                    <Square className="h-5 w-5 text-brand-storm" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-sm font-semibold ${isChecked ? 'line-through text-opacity-80' : ''}`}>
                      {idx + 1}. {doc.name[language] || doc.name.en}
                    </span>
                    <Badge variant={doc.is_mandatory ? 'default' : 'outline'} className="text-[10px]">
                      {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                    </Badge>
                  </div>

                  {doc.description && (
                    <p className="mt-1 text-xs text-brand-mutedText">
                      {doc.description[language] || doc.description.en}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action to Track */}
        <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
          <span className="text-xs text-brand-mutedText">
            Tip: Ready documents accelerate your institutional verification.
          </span>

          <Button asChild variant="primary" size="sm">
            <Link to={`/scholarships/${selectedScheme.slug}`}>
              <span>Apply for Scheme</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
