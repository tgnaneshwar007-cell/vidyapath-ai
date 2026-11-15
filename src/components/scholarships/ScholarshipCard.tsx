import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scholarship } from '@/types';
import { useTranslation } from '@/locales/LanguageContext';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onSavedChange?: (isSaved: boolean) => void;
  glassmorphic?: boolean;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ 
  scholarship, 
  onSavedChange,
  glassmorphic = true
}) => {
  const { language, t } = useTranslation();
  const [isSaved, setIsSaved] = useState(() => ScholarshipRepository.isScholarshipSaved(scholarship.id));

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = ScholarshipRepository.toggleSaveScholarship(scholarship.id);
    setIsSaved(updated);
    if (onSavedChange) onSavedChange(updated);
  };

  const title = scholarship.title[language] || scholarship.title.en;
  const provider = scholarship.provider[language] || scholarship.provider.en;
  const benefits = scholarship.benefits[language] || scholarship.benefits.en;

  const getSchemeBadge = () => {
    switch (scholarship.scheme_type) {
      case 'central':
        return <Badge variant="central">{t.common.centralGov}</Badge>;
      case 'state':
        return <Badge variant="state">{t.common.stateGov}</Badge>;
      case 'private':
        return <Badge variant="private">{t.common.privateScheme}</Badge>;
    }
  };

  const formatDeadline = () => {
    if (!scholarship.closing_date) {
      return (
        <span className="text-brand-mutedText text-xs font-sans">
          {t.common.noDeadlineProvided}
        </span>
      );
    }
    const closing = new Date(scholarship.closing_date);
    const now = new Date();
    const diffDays = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 3600 * 24));

    const dateStr = closing.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-brand-danger font-medium text-xs">
          <span>Closed ({dateStr})</span>
        </span>
      );
    }

    if (diffDays <= 15) {
      return (
        <span className="inline-flex items-center gap-1 text-brand-warning font-semibold text-xs">
          <span>Closes {dateStr} ({diffDays}d left)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-brand-storm-dark text-xs">
        <span>Closes {dateStr}</span>
      </span>
    );
  };

  return (
    <div 
      className={`group flex flex-col justify-between rounded-xl p-5 md:p-6 ${
        glassmorphic ? 'glass-card' : 'rounded-lg border border-brand-border bg-brand-surface shadow-card'
      } tap-60fps`}
    >
      <div>
        {/* Top Badges & Save Action */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {getSchemeBadge()}
            <Badge variant="verified" className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>{t.common.verifiedScheme}</span>
            </Badge>
          </div>

          <button
            onClick={handleToggleSave}
            className="tap-60fps rounded-md p-1.5 text-brand-mutedText hover:bg-brand-storm-subtle hover:text-brand-orange transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            title={isSaved ? t.common.saved : t.common.saveScholarship}
            aria-label={isSaved ? "Remove from saved scholarships" : "Save scholarship"}
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-brand-orange fill-brand-orange/20" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Title in Editorial Serif */}
        <div className="mt-3.5">
          <Link
            to={`/scholarships/${scholarship.slug}`}
            className="block text-lg md:text-xl font-serif font-bold text-brand-black hover:text-brand-orange transition-colors line-clamp-2 leading-snug tracking-tight"
          >
            {title}
          </Link>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-mutedText">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-brand-storm" />
            <span className="line-clamp-1">{provider}</span>
          </div>
        </div>

        {/* Award Benefits Summary */}
        <div className="mt-3.5 rounded-lg bg-white/60 backdrop-blur-sm px-3.5 py-2.5 text-xs text-brand-black/90 leading-relaxed border border-brand-border/60">
          <span className="font-semibold text-brand-black">Benefits: </span>
          <span className="line-clamp-2">{benefits}</span>
        </div>

        {/* Key Metadata Pills */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-brand-storm-dark">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-storm" />
            <span className="truncate">
              {scholarship.eligible_states.includes('All India') 
                ? 'All India' 
                : scholarship.eligible_states.slice(0, 2).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-brand-storm" />
            <span className="truncate">
              {scholarship.education_levels.map(l => l.replace(/_/g, ' ')).slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 border-t border-brand-border/50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col text-xs text-brand-mutedText">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brand-storm" />
            {formatDeadline()}
          </div>
          <span className="text-[11px] text-brand-storm mt-0.5">
            {t.common.lastVerified}: {new Date(scholarship.last_verified_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="tap-60fps">
            <Link to={`/scholarships/${scholarship.slug}`}>
              <span>{t.common.viewDetails}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
          <a
            href={scholarship.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-60fps inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-border text-brand-mutedText hover:text-brand-black hover:bg-brand-storm-subtle transition-colors"
            title={t.common.officialPortal}
            aria-label="Open official scholarship portal in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
