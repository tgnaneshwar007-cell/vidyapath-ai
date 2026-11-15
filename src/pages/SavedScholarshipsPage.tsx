import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scholarship } from '@/types';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { useTranslation } from '@/locales/LanguageContext';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';

export const SavedScholarshipsPage: React.FC = () => {
  const { t } = useTranslation();
  const [savedScholarships, setSavedScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    const data = await ScholarshipRepository.getSavedScholarships();
    setSavedScholarships(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black font-display">
            {t.nav.saved}
          </h1>
          <p className="mt-1 text-sm text-brand-mutedText">
            Verified scholarship schemes you have bookmarked for future reference and application.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link to="/scholarships">
            Browse Directory
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-brand-mutedText">
          {t.common.loading}
        </div>
      ) : savedScholarships.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-brand-surface p-12 text-center shadow-card">
          <Bookmark className="h-10 w-10 text-brand-storm mx-auto mb-3" />
          <h3 className="text-base font-semibold text-brand-black">
            No saved scholarships yet
          </h3>
          <p className="mt-1 text-sm text-brand-mutedText max-w-md mx-auto">
            Click the bookmark icon on any scholarship card in the directory to save it here for quick access.
          </p>
          <Button asChild variant="primary" size="sm" className="mt-4">
            <Link to="/scholarships">Explore Scholarships</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedScholarships.map((s) => (
            <ScholarshipCard
              key={s.id}
              scholarship={s}
              onSavedChange={() => loadSaved()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
