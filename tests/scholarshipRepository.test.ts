import { describe, it, expect, beforeEach } from 'vitest';
import { ScholarshipRepository } from '../src/services/scholarshipRepository';
import { VERIFIED_SCHOLARSHIPS } from '../src/data/verifiedScholarships';

describe('ScholarshipRepository - Search, Filters, and Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves all verified scholarships without filters', async () => {
    const result = await ScholarshipRepository.getScholarships();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.totalCount).toBe(VERIFIED_SCHOLARSHIPS.length);
  });

  it('filters scholarships accurately by keyword search', async () => {
    const result = await ScholarshipRepository.getScholarships({ search: 'Pragati' });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data[0].slug).toContain('pragati');
  });

  it('filters scholarships by central scheme type', async () => {
    const result = await ScholarshipRepository.getScholarships({ schemeType: 'central' });
    result.data.forEach((s) => {
      expect(s.scheme_type).toBe('central');
    });
  });

  it('filters scholarships by state domicile', async () => {
    const result = await ScholarshipRepository.getScholarships({ state: 'Telangana' });
    result.data.forEach((s) => {
      const isEligible = s.eligible_states.includes('All India') || s.eligible_states.includes('Telangana');
      expect(isEligible).toBe(true);
    });
  });

  it('saves and un-saves scholarships in local storage bookmark store', () => {
    const testId = 'sc-post-matric-nsp';
    expect(ScholarshipRepository.isScholarshipSaved(testId)).toBe(false);

    const savedState = ScholarshipRepository.toggleSaveScholarship(testId);
    expect(savedState).toBe(true);
    expect(ScholarshipRepository.isScholarshipSaved(testId)).toBe(true);

    const unSavedState = ScholarshipRepository.toggleSaveScholarship(testId);
    expect(unSavedState).toBe(false);
    expect(ScholarshipRepository.isScholarshipSaved(testId)).toBe(false);
  });

  it('creates and tracks application progress correctly', () => {
    const sampleScheme = VERIFIED_SCHOLARSHIPS[0];
    const app = ScholarshipRepository.trackScholarship(sampleScheme, 'preparing_documents');
    
    expect(app.scholarship_id).toBe(sampleScheme.id);
    expect(app.stage).toBe('preparing_documents');
    expect(app.checklist.length).toBe(sampleScheme.required_documents.length);

    // Update stage
    ScholarshipRepository.updateApplicationStage(app.id, 'submitted', 'Application submitted with ref #NSP2026');
    const apps = ScholarshipRepository.getTrackedApplications();
    const updated = apps.find(a => a.id === app.id);
    expect(updated?.stage).toBe('submitted');
    expect(updated?.notes).toContain('NSP2026');
  });
});
