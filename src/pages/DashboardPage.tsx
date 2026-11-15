import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrackedApplication } from '@/types';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { useTranslation } from '@/locales/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  BookmarkCheck, 
  FileCheck2, 
  ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { language } = useTranslation();
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const apps = ScholarshipRepository.getTrackedApplications();
    setApplications(apps);
    const saved = ScholarshipRepository.getSavedScholarshipIds();
    setSavedCount(saved.length);
  }, []);

  // Calculate upcoming deadlines in IST
  const upcomingDeadlines = applications
    .filter((a) => a.scholarship?.closing_date)
    .sort((a, b) => new Date(a.scholarship.closing_date!).getTime() - new Date(b.scholarship.closing_date!).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black font-display">
            Student Scholarship Dashboard
          </h1>
          <p className="mt-1 text-sm text-brand-mutedText">
            Track confirmed deadlines, document preparations, and application milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/saved-scholarships">
              View Saved ({savedCount})
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to="/scholarships">
              Explore More
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-semibold text-brand-mutedText">Active Trackers</span>
            <FileCheck2 className="h-4 w-4 text-brand-orange" />
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-black">
            {applications.length}
          </div>
          <span className="text-xs text-brand-storm-dark mt-1 block">
            {applications.filter(a => a.stage === 'submitted').length} submitted on portal
          </span>
        </div>

        <div className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-semibold text-brand-mutedText">Saved Bookmarks</span>
            <BookmarkCheck className="h-4 w-4 text-brand-storm" />
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-black">
            {savedCount}
          </div>
          <span className="text-xs text-brand-storm-dark mt-1 block">
            Schemes pinned for later review
          </span>
        </div>

        <div className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-semibold text-brand-mutedText">Confirmed Deadlines</span>
            <Clock className="h-4 w-4 text-brand-warning" />
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-black">
            {upcomingDeadlines.length}
          </div>
          <span className="text-xs text-brand-storm-dark mt-1 block">
            Chronological deadlines in IST
          </span>
        </div>
      </div>

      {/* Upcoming Confirmed Deadlines Table */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-4">
          <h2 className="text-base font-bold text-brand-black flex items-center gap-2 font-display">
            <Calendar className="h-4 w-4 text-brand-orange" />
            <span>Application Timeline (IST)</span>
          </h2>
          <span className="text-xs text-brand-mutedText font-mono">Real Confirmed Dates Only</span>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <div className="py-8 text-center text-sm text-brand-mutedText">
            No active tracked scholarships with confirmed deadlines.
            <div className="mt-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/scholarships">Browse Directory</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/60">
            {upcomingDeadlines.map((app) => {
              const closing = new Date(app.scholarship.closing_date!);
              const now = new Date();
              const diffDays = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 3600 * 24));

              return (
                <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Link
                      to={`/scholarships/${app.scholarship.slug}`}
                      className="font-medium text-sm text-brand-black hover:text-brand-orange transition-colors"
                    >
                      {app.scholarship.title[language] || app.scholarship.title.en}
                    </Link>
                    <div className="text-xs text-brand-mutedText">
                      Stage: <span className="font-semibold capitalize text-brand-black">{app.stage.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className={`text-xs font-semibold ${diffDays <= 15 ? 'text-brand-warning' : 'text-brand-storm-dark'}`}>
                      {closing.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {diffDays > 0 ? ` (${diffDays} days left)` : ' (Closed)'}
                    </span>

                    <Button asChild variant="outline" size="sm">
                      <Link to="/applications">Update</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/applications"
          className="rounded-lg border border-brand-border bg-brand-surface p-5 hover:border-brand-storm transition-colors shadow-subtle group"
        >
          <h3 className="font-semibold text-brand-black text-sm group-hover:text-brand-orange flex items-center justify-between">
            <span>Manage Applications Tracker</span>
            <ArrowRight className="h-4 w-4" />
          </h3>
          <p className="mt-1 text-xs text-brand-mutedText">
            Update document preparation status and user-managed tracking stages.
          </p>
        </Link>

        <Link
          to="/documents"
          className="rounded-lg border border-brand-border bg-brand-surface p-5 hover:border-brand-storm transition-colors shadow-subtle group"
        >
          <h3 className="font-semibold text-brand-black text-sm group-hover:text-brand-orange flex items-center justify-between">
            <span>Mandatory Document Checklist</span>
            <ArrowRight className="h-4 w-4" />
          </h3>
          <p className="mt-1 text-xs text-brand-mutedText">
            Verify readiness for Income Certificate, Caste Proof, and Bonafides.
          </p>
        </Link>

        <Link
          to="/profile"
          className="rounded-lg border border-brand-border bg-brand-surface p-5 hover:border-brand-storm transition-colors shadow-subtle group"
        >
          <h3 className="font-semibold text-brand-black text-sm group-hover:text-brand-orange flex items-center justify-between">
            <span>Student Profile & Settings</span>
            <ArrowRight className="h-4 w-4" />
          </h3>
          <p className="mt-1 text-xs text-brand-mutedText">
            Update your domicile state, course, family income bracket, and notification preferences.
          </p>
        </Link>
      </div>
    </div>
  );
};
