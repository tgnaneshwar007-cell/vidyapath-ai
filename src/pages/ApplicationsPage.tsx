import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrackedApplication, ApplicationStage } from '@/types';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { useTranslation } from '@/locales/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Plus
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [applications, setApplications] = useState<TrackedApplication[]>([]);

  useEffect(() => {
    setApplications(ScholarshipRepository.getTrackedApplications());
  }, []);

  const handleStageChange = (appId: string, newStage: ApplicationStage) => {
    ScholarshipRepository.updateApplicationStage(appId, newStage);
    setApplications(ScholarshipRepository.getTrackedApplications());
  };

  const handleToggleChecklist = (appId: string, checkItemId: string) => {
    ScholarshipRepository.toggleChecklistItem(appId, checkItemId);
    setApplications(ScholarshipRepository.getTrackedApplications());
  };

  const handleRemove = (appId: string) => {
    ScholarshipRepository.removeTrackedApplication(appId);
    setApplications(ScholarshipRepository.getTrackedApplications());
  };

  const stages: { value: ApplicationStage; label: string }[] = [
    { value: 'interested', label: t.tracker.stageInterested },
    { value: 'preparing_documents', label: t.tracker.stagePreparing },
    { value: 'ready_to_apply', label: t.tracker.stageReady },
    { value: 'submitted', label: t.tracker.stageSubmitted },
    { value: 'under_review', label: t.tracker.stageUnderReview },
    { value: 'approved', label: t.tracker.stageApproved },
    { value: 'rejected', label: t.tracker.stageRejected },
    { value: 'withdrawn', label: t.tracker.stageWithdrawn },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black font-display">
            {t.tracker.title}
          </h1>
          <p className="mt-1 text-sm text-brand-mutedText">
            {t.tracker.subtitle}
          </p>
        </div>

        <Button asChild variant="primary" size="sm">
          <Link to="/scholarships" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add Scholarship to Track</span>
          </Link>
        </Button>
      </div>

      {/* Advisory Banner */}
      <div className="rounded-lg border border-brand-border bg-brand-storm-subtle/40 p-4 text-xs text-brand-mutedText flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-brand-storm shrink-0 mt-0.5" />
        <p>
          <strong>Transparency Notice:</strong> These statuses are managed by you for personal planning. They do not represent official government portal sanction decisions until verified by the scheme officer.
        </p>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-brand-surface p-12 text-center shadow-card">
          <p className="text-sm text-brand-mutedText">
            {t.tracker.noApplications}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/scholarships">Explore Scholarships</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card space-y-5"
            >
              {/* Application Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-brand-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-mono">
                      Personal Tracker
                    </Badge>
                    <span className="text-xs text-brand-mutedText">
                      Added on {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <h3 className="mt-1 text-lg font-bold text-brand-black">
                    <Link
                      to={`/scholarships/${app.scholarship?.slug || ''}`}
                      className="hover:text-brand-orange transition-colors"
                    >
                      {app.scholarship?.title[language] || app.scholarship?.title.en || 'Tracked Scholarship'}
                    </Link>
                  </h3>
                  <p className="text-xs text-brand-mutedText">
                    {app.scholarship?.provider.en}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <a
                    href={app.scholarship?.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded border border-brand-border px-2.5 py-1 text-xs text-brand-black hover:bg-brand-storm-subtle"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={() => handleRemove(app.id)}
                    className="p-1.5 rounded text-brand-mutedText hover:text-brand-danger hover:bg-red-50"
                    title="Remove Tracker"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stage Progression Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                  Current Application Stage:
                </label>
                <div className="flex flex-wrap gap-2">
                  {stages.map((st) => (
                    <button
                      key={st.value}
                      onClick={() => handleStageChange(app.id, st.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        app.stage === st.value
                          ? 'bg-brand-black text-white font-semibold'
                          : 'border border-brand-border bg-brand-surface text-brand-mutedText hover:border-brand-storm'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist Items */}
              {app.checklist && app.checklist.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                    {t.tracker.documentChecklist}:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {app.checklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleToggleChecklist(app.id, item.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-md border text-left text-xs transition-colors ${
                          item.is_ready
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900 line-through text-opacity-80'
                            : 'border-brand-border bg-brand-warmWhite/50 text-brand-black'
                        }`}
                      >
                        {item.is_ready ? (
                          <CheckSquare className="h-4 w-4 text-brand-success shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-brand-storm shrink-0" />
                        )}
                        <span className="truncate">{item.document_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
