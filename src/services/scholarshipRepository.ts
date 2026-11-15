import { Scholarship, SchemeType, EducationLevel, TrackedApplication, ApplicationStage, UserProfile } from '../types';
import { VERIFIED_SCHOLARSHIPS } from '../data/verifiedScholarships';
// import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface ScholarshipFilters {
  search?: string;
  schemeType?: SchemeType | 'all';
  educationLevel?: EducationLevel | 'all';
  state?: string;
  category?: string;
  gender?: string;
  maxIncome?: number;
  status?: 'all' | 'open' | 'closing_soon' | 'closed';
  sortBy?: 'deadline_asc' | 'verified_desc' | 'amount_desc' | 'title_asc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedScholarships {
  data: Scholarship[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const LOCAL_STORAGE_SAVED_KEY = 'vidyapath_saved_scholarships';
const LOCAL_STORAGE_APPS_KEY = 'vidyapath_applications';
const LOCAL_STORAGE_PROFILE_KEY = 'vidyapath_user_profile';

export class ScholarshipRepository {
  /**
   * Query scholarships with flexible search, filtering, and sorting
   */
  static async getScholarships(filters: ScholarshipFilters = {}): Promise<PaginatedScholarships> {
    // If Supabase is configured, we can query Supabase, otherwise use verified bundled dataset
    let dataset = [...VERIFIED_SCHOLARSHIPS];

    // Search filter across title, provider, and description in all languages
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      dataset = dataset.filter((s) => {
        const matchesTitle = 
          s.title.en.toLowerCase().includes(q) ||
          s.title.te.toLowerCase().includes(q) ||
          s.title.hi.toLowerCase().includes(q);
        const matchesProvider = 
          s.provider.en.toLowerCase().includes(q) ||
          s.provider.te.toLowerCase().includes(q) ||
          s.provider.hi.toLowerCase().includes(q);
        const matchesDesc =
          s.description.en.toLowerCase().includes(q) ||
          s.description.te.toLowerCase().includes(q) ||
          s.description.hi.toLowerCase().includes(q);
        const matchesStates = s.eligible_states.some((st) => st.toLowerCase().includes(q));

        return matchesTitle || matchesProvider || matchesDesc || matchesStates;
      });
    }

    // Scheme Type filter
    if (filters.schemeType && filters.schemeType !== 'all') {
      dataset = dataset.filter((s) => s.scheme_type === filters.schemeType);
    }

    // Education Level filter
    if (filters.educationLevel && filters.educationLevel !== 'all') {
      dataset = dataset.filter((s) => 
        s.education_levels.includes(filters.educationLevel as EducationLevel)
      );
    }

    // State filter
    if (filters.state && filters.state !== 'all' && filters.state !== 'All India') {
      dataset = dataset.filter((s) => 
        s.eligible_states.includes('All India') || s.eligible_states.includes(filters.state!)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      dataset = dataset.filter((s) => 
        s.applicable_categories.includes('General') || 
        s.applicable_categories.includes(filters.category!)
      );
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      dataset = dataset.filter((s) => 
        s.applicable_genders.includes('all') ||
        s.applicable_genders.includes(filters.gender as any)
      );
    }

    // Income ceiling filter
    if (filters.maxIncome && filters.maxIncome > 0) {
      dataset = dataset.filter((s) => 
        s.income_limit === null || s.income_limit >= filters.maxIncome!
      );
    }

    // Status filter (open, closing soon, closed)
    if (filters.status && filters.status !== 'all') {
      const now = new Date();
      dataset = dataset.filter((s) => {
        if (!s.closing_date) return filters.status === 'open';
        const closing = new Date(s.closing_date);
        const diffDays = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (filters.status === 'closed') {
          return diffDays < 0;
        }
        if (filters.status === 'closing_soon') {
          return diffDays >= 0 && diffDays <= 15;
        }
        if (filters.status === 'open') {
          return diffDays >= 0;
        }
        return true;
      });
    }

    // Sorting
    const sortBy = filters.sortBy || 'verified_desc';
    dataset.sort((a, b) => {
      if (sortBy === 'deadline_asc') {
        if (!a.closing_date) return 1;
        if (!b.closing_date) return -1;
        return new Date(a.closing_date).getTime() - new Date(b.closing_date).getTime();
      }
      if (sortBy === 'amount_desc') {
        return (b.award_amount || 0) - (a.award_amount || 0);
      }
      if (sortBy === 'title_asc') {
        return a.title.en.localeCompare(b.title.en);
      }
      // verified_desc (default)
      return new Date(b.last_verified_at).getTime() - new Date(a.last_verified_at).getTime();
    });

    const totalCount = dataset.length;
    const pageSize = filters.pageSize || 10;
    const currentPage = filters.page || 1;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = dataset.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      totalCount,
      currentPage,
      totalPages,
    };
  }

  /**
   * Get single scholarship by unique slug
   */
  static async getScholarshipBySlug(slug: string): Promise<Scholarship | null> {
    const item = VERIFIED_SCHOLARSHIPS.find((s) => s.slug === slug || s.id === slug);
    return item || null;
  }

  /**
   * Get list of unique states
   */
  static getAvailableStates(): string[] {
    const stateSet = new Set<string>();
    VERIFIED_SCHOLARSHIPS.forEach((s) => {
      s.eligible_states.forEach((st) => {
        if (st !== 'All India') stateSet.add(st);
      });
    });
    // Add prominent Indian states
    const prominentStates = [
      'Andhra Pradesh',
      'Telangana',
      'Karnataka',
      'Tamil Nadu',
      'Maharashtra',
      'Uttar Pradesh',
      'Bihar',
      'Madhya Pradesh',
      'Rajasthan',
      'West Bengal',
      'Kerala',
      'Delhi',
      'Gujarat',
      'Punjab',
      'Odisha'
    ];
    prominentStates.forEach((st) => stateSet.add(st));
    return Array.from(stateSet).sort();
  }

  /**
   * Saved Scholarships (Bookmarks)
   */
  static getSavedScholarshipIds(): string[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static isScholarshipSaved(id: string): boolean {
    return this.getSavedScholarshipIds().includes(id);
  }

  static toggleSaveScholarship(id: string): boolean {
    const current = this.getSavedScholarshipIds();
    let updated: string[];
    let isNowSaved = false;
    if (current.includes(id)) {
      updated = current.filter((item) => item !== id);
      isNowSaved = false;
    } else {
      updated = [...current, id];
      isNowSaved = true;
    }
    localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(updated));
    return isNowSaved;
  }

  static async getSavedScholarships(): Promise<Scholarship[]> {
    const ids = this.getSavedScholarshipIds();
    return VERIFIED_SCHOLARSHIPS.filter((s) => ids.includes(s.id));
  }

  /**
   * Application Progress Tracker Operations
   */
  static getTrackedApplications(): TrackedApplication[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_APPS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      // Re-link full scholarship object
      return parsed.map((app: any) => ({
        ...app,
        scholarship: VERIFIED_SCHOLARSHIPS.find((s) => s.id === app.scholarship_id) || app.scholarship,
      }));
    } catch {
      return [];
    }
  }

  static trackScholarship(scholarship: Scholarship, initialStage: ApplicationStage = 'interested'): TrackedApplication {
    const apps = this.getTrackedApplications();
    const existing = apps.find((a) => a.scholarship_id === scholarship.id);
    if (existing) return existing;

    const newApp: TrackedApplication = {
      id: `app_${Date.now()}`,
      user_id: 'guest_or_current_user',
      scholarship_id: scholarship.id,
      scholarship,
      stage: initialStage,
      notes: '',
      checklist: scholarship.required_documents.map((doc) => ({
        id: `check_${doc.id}`,
        document_name: doc.name.en,
        is_mandatory: doc.is_mandatory,
        is_ready: false,
      })),
      reminder_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    apps.unshift(newApp);
    localStorage.setItem(LOCAL_STORAGE_APPS_KEY, JSON.stringify(apps));
    return newApp;
  }

  static updateApplicationStage(appId: string, stage: ApplicationStage, notes?: string): void {
    const apps = this.getTrackedApplications();
    const idx = apps.findIndex((a) => a.id === appId);
    if (idx !== -1) {
      apps[idx].stage = stage;
      if (notes !== undefined) apps[idx].notes = notes;
      apps[idx].updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_APPS_KEY, JSON.stringify(apps));
    }
  }

  static toggleChecklistItem(appId: string, checkItemId: string): void {
    const apps = this.getTrackedApplications();
    const app = apps.find((a) => a.id === appId);
    if (app) {
      const item = app.checklist.find((c) => c.id === checkItemId);
      if (item) {
        item.is_ready = !item.is_ready;
        app.updated_at = new Date().toISOString();
        localStorage.setItem(LOCAL_STORAGE_APPS_KEY, JSON.stringify(apps));
      }
    }
  }

  static removeTrackedApplication(appId: string): void {
    const apps = this.getTrackedApplications().filter((a) => a.id !== appId);
    localStorage.setItem(LOCAL_STORAGE_APPS_KEY, JSON.stringify(apps));
  }

  /**
   * User Profile Operations
   */
  static getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {
      id: 'profile_local',
      full_name: 'Student Candidate',
      email: 'student@example.in',
      preferred_language: 'en',
      state: 'Andhra Pradesh',
      education_level: 'undergraduate',
      course: 'B.Tech Computer Science',
      annual_family_income: 180000,
      category: 'OBC',
      gender: 'female',
      is_admin: false,
      consent_preferences: {
        marketing: false,
        application_reminders: true,
        deadline_alerts: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static saveUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated: UserProfile = {
      ...current,
      ...profile,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  }
}
