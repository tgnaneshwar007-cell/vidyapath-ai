import { describe, it, expect } from 'vitest';
import { EligibilityEngine } from '../src/services/eligibilityEngine';
import { VERIFIED_SCHOLARSHIPS } from '../src/data/verifiedScholarships';
import { StudentEligibilityProfile } from '../src/types';

describe('EligibilityEngine - Deterministic Verification Logic', () => {
  const scScheme = VERIFIED_SCHOLARSHIPS.find(s => s.id === 'sc-post-matric-nsp')!;
  const pragatiScheme = VERIFIED_SCHOLARSHIPS.find(s => s.id === 'aicte-pragati-girls')!;

  it('correctly evaluates a student who meets all SC Post-Matric requirements', () => {
    const student: StudentEligibilityProfile = {
      state: 'Andhra Pradesh',
      education_level: 'undergraduate',
      course: 'B.Tech',
      family_income: 180000, // < 250,000 ceiling
      category: 'SC',
      gender: 'male',
      previous_marks_percentage: 70,
    };

    const report = EligibilityEngine.evaluateScholarship(scScheme, student, 'en');
    expect(report.verdict).toBe('appears_eligible');
    expect(report.failed_count).toBe(0);
    expect(report.satisfied_count).toBeGreaterThanOrEqual(3);
  });

  it('flags student as not eligible if family income exceeds statutory limit', () => {
    const student: StudentEligibilityProfile = {
      state: 'Andhra Pradesh',
      education_level: 'undergraduate',
      course: 'B.Tech',
      family_income: 350000, // Exceeds ₹2,50,000 limit
      category: 'SC',
      gender: 'male',
    };

    const report = EligibilityEngine.evaluateScholarship(scScheme, student, 'en');
    expect(report.verdict).toBe('not_eligible');
    expect(report.failed_count).toBeGreaterThanOrEqual(1);
    
    const incomeCondition = report.conditions.find(c => c.condition_id === 'income_check');
    expect(incomeCondition?.status).toBe('failed');
  });

  it('enforces gender restriction for girl-specific schemes (AICTE Pragati)', () => {
    const maleStudent: StudentEligibilityProfile = {
      state: 'Maharashtra',
      education_level: 'undergraduate',
      course: 'B.Tech Mechanical',
      family_income: 300000,
      category: 'General',
      gender: 'male',
    };

    const report = EligibilityEngine.evaluateScholarship(pragatiScheme, maleStudent, 'en');
    expect(report.verdict).toBe('not_eligible');
    const genderCondition = report.conditions.find(c => c.condition_id === 'gender_check');
    expect(genderCondition?.status).toBe('failed');
  });

  it('marks evaluation as potentially eligible when critical information is missing', () => {
    const studentWithMissingInfo: StudentEligibilityProfile = {
      state: '',
      education_level: 'undergraduate',
      course: 'B.Tech',
      family_income: 200000,
      category: 'General',
      gender: 'female',
    };

    const report = EligibilityEngine.evaluateScholarship(pragatiScheme, studentWithMissingInfo, 'en');
    expect(report.missing_count).toBeGreaterThan(0);
    expect(['potentially_eligible', 'cannot_determine']).toContain(report.verdict);
  });

  it('renders translated report summaries in Telugu and Hindi', () => {
    const student: StudentEligibilityProfile = {
      state: 'Telangana',
      education_level: 'undergraduate',
      course: 'B.Tech',
      family_income: 150000,
      category: 'SC',
      gender: 'female',
    };

    const teReport = EligibilityEngine.evaluateScholarship(scScheme, student, 'te');
    expect(teReport.summary).toContain('అర్హత');

    const hiReport = EligibilityEngine.evaluateScholarship(scScheme, student, 'hi');
    expect(hiReport.summary).toContain('पात्रता');
  });
});
