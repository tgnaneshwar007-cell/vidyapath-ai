export type Language = 'en' | 'te' | 'hi';

export type SchemeType = 'central' | 'state' | 'private';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type EducationLevel = 
  | 'class_9_10'
  | 'class_11_12'
  | 'diploma'
  | 'undergraduate'
  | 'postgraduate'
  | 'phd'
  | 'all';

export interface ScholarshipSource {
  id: string;
  scholarship_id: string;
  source_name: string;
  source_url: string;
  source_type: 'official_portal' | 'ministry_gazette' | 'foundation_announcement';
  checked_at: string;
  verification_notes?: string;
}

export interface EligibilityCondition {
  id: string;
  field: 'state' | 'education_level' | 'income' | 'category' | 'gender' | 'minimum_marks' | 'course';
  operator: 'equals' | 'in' | 'lte' | 'gte' | 'any';
  value: string | number | string[];
  description: {
    en: string;
    te: string;
    hi: string;
  };
  is_mandatory: boolean;
}

export interface RequiredDocumentItem {
  id: string;
  name: {
    en: string;
    te: string;
    hi: string;
  };
  is_mandatory: boolean;
  description?: {
    en: string;
    te: string;
    hi: string;
  };
  official_reference_note?: string;
}

export interface Scholarship {
  id: string;
  slug: string;
  title: {
    en: string;
    te: string;
    hi: string;
  };
  provider: {
    en: string;
    te: string;
    hi: string;
  };
  scheme_type: SchemeType;
  description: {
    en: string;
    te: string;
    hi: string;
  };
  benefits: {
    en: string;
    te: string;
    hi: string;
  };
  award_amount?: number; // In INR per annum when quantifiable
  education_levels: EducationLevel[];
  eligible_states: string[]; // State names or ['All India']
  income_limit: number | null; // In INR per annum (null if no limit)
  applicable_categories: string[]; // ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority']
  applicable_genders: ('all' | 'female' | 'male' | 'transgender')[];
  eligibility_conditions: EligibilityCondition[];
  required_documents: RequiredDocumentItem[];
  application_instructions: {
    en: string[];
    te: string[];
    hi: string[];
  };
  opening_date: string | null; // ISO YYYY-MM-DD
  closing_date: string | null; // ISO YYYY-MM-DD (Confirmed IST)
  is_deadline_tentative?: boolean;
  official_url: string;
  verification_status: VerificationStatus;
  last_verified_at: string; // ISO date
  sources: ScholarshipSource[];
  created_at: string;
  updated_at: string;
}

export interface StudentEligibilityProfile {
  state: string;
  education_level: EducationLevel;
  course: string;
  family_income: number;
  category: string;
  gender: string;
  previous_marks_percentage?: number;
}

export type ConditionCheckStatus = 'satisfied' | 'failed' | 'missing_info' | 'not_applicable';

export interface ConditionResult {
  condition_id: string;
  title: string;
  status: ConditionCheckStatus;
  student_value: string | number | undefined;
  requirement_description: string;
  guidance_note?: string;
}

export type EligibilityVerdict = 
  | 'appears_eligible'
  | 'potentially_eligible'
  | 'not_eligible'
  | 'cannot_determine';

export interface EligibilityEvaluationReport {
  scholarship_id: string;
  scholarship_title: string;
  verdict: EligibilityVerdict;
  satisfied_count: number;
  failed_count: number;
  missing_count: number;
  conditions: ConditionResult[];
  summary: string;
  disclaimer: string;
}

export type ApplicationStage =
  | 'interested'
  | 'preparing_documents'
  | 'ready_to_apply'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationChecklistItem {
  id: string;
  document_name: string;
  is_mandatory: boolean;
  is_ready: boolean;
  notes?: string;
}

export interface TrackedApplication {
  id: string;
  user_id: string;
  scholarship_id: string;
  scholarship: Scholarship;
  stage: ApplicationStage;
  notes: string;
  application_number?: string;
  submission_date?: string;
  checklist: ApplicationChecklistItem[];
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedScholarship {
  id: string;
  user_id: string;
  scholarship_id: string;
  saved_at: string;
  scholarship?: Scholarship;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  preferred_language: Language;
  state: string;
  education_level: EducationLevel;
  course: string;
  annual_family_income: number;
  category: string;
  gender: string;
  is_admin?: boolean;
  consent_preferences: {
    marketing: boolean;
    application_reminders: boolean;
    deadline_alerts: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AISourceCitation {
  scholarship_id: string;
  title: string;
  official_url: string;
  verified_date: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: Language;
  citations?: AISourceCitation[];
  timestamp: string;
  feedback?: 'helpful' | 'unhelpful';
}
