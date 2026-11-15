import React, { useState, useEffect } from 'react';
import { UserProfile, EducationLevel, Language } from '@/types';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { useTranslation } from '@/locales/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Bell, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const availableStates = ScholarshipRepository.getAvailableStates();

  const [profile, setProfile] = useState<UserProfile>(() => {
    const local = ScholarshipRepository.getUserProfile();
    if (authProfile) {
      return { ...local, ...authProfile };
    }
    return local;
  });

  useEffect(() => {
    if (authProfile) {
      setProfile((prev) => ({
        ...prev,
        ...authProfile,
        email: user?.email || authProfile.email || prev.email,
        full_name: authProfile.full_name || prev.full_name,
      }));
    }
  }, [authProfile, user]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = ScholarshipRepository.saveUserProfile(profile);
    setProfile(updated);
    if (profile.preferred_language !== language) {
      setLanguage(profile.preferred_language);
    }
    await refreshProfile();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteData = () => {
    localStorage.removeItem('vidyapath_user_profile');
    localStorage.removeItem('vidyapath_saved_scholarships');
    localStorage.removeItem('vidyapath_applications');
    setDeleteConfirmed(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-brand-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black font-display">
          {t.nav.profile}
        </h1>
        <p className="mt-1 text-sm text-brand-mutedText">
          Manage your education background, domicile state, and notification preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {deleteConfirmed && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span>All local personal data, tracked applications, and bookmarks have been purged.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Academic & Demographic Particulars */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card space-y-5">
          <h2 className="text-base font-bold text-brand-black flex items-center gap-2 font-display pb-3 border-b border-brand-border">
            <User className="h-4 w-4 text-brand-orange" />
            <span>Academic & Demographic Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                State of Residence
              </label>
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Current Education Level
              </label>
              <select
                value={profile.education_level}
                onChange={(e) => setProfile({ ...profile, education_level: e.target.value as EducationLevel })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none"
              >
                <option value="class_9_10">Class 9 - 10</option>
                <option value="class_11_12">Class 11 - 12 (Intermediate)</option>
                <option value="diploma">Diploma / Polytechnic</option>
                <option value="undergraduate">Undergraduate Degree</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="phd">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Current Course
              </label>
              <Input
                type="text"
                value={profile.course}
                onChange={(e) => setProfile({ ...profile, course: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Annual Family Income (INR)
              </label>
              <Input
                type="number"
                value={profile.annual_family_income}
                onChange={(e) => setProfile({ ...profile, annual_family_income: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Social Category
              </label>
              <select
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none"
              >
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="EWS">EWS</option>
                <option value="Minority">Minority</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Preferred Interface Language
              </label>
              <select
                value={profile.preferred_language}
                onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value as Language })}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-brand-black flex items-center gap-2 font-display pb-3 border-b border-brand-border">
            <Bell className="h-4 w-4 text-brand-storm" />
            <span>Transactional Notification Preferences</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-brand-black cursor-pointer">
              <input
                type="checkbox"
                checked={profile.consent_preferences?.deadline_alerts ?? true}
                onChange={(e) => setProfile({
                  ...profile,
                  consent_preferences: {
                    ...profile.consent_preferences,
                    deadline_alerts: e.target.checked,
                  },
                })}
                className="h-4 w-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange"
              />
              <span>Confirmed deadline reminders (sent 7 days prior to confirmed close date)</span>
            </label>

            <label className="flex items-center gap-3 text-sm text-brand-black cursor-pointer">
              <input
                type="checkbox"
                checked={profile.consent_preferences?.application_reminders ?? true}
                onChange={(e) => setProfile({
                  ...profile,
                  consent_preferences: {
                    ...profile.consent_preferences,
                    application_reminders: e.target.checked,
                  },
                })}
                className="h-4 w-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange"
              />
              <span>Application document checklist progress reminders</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button type="submit" variant="primary" size="lg">
            Save Profile Settings
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleDeleteData}
            className="text-brand-danger hover:bg-red-50 hover:text-brand-danger flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Purge Local Data</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
