import { describe, it, expect } from 'vitest';
import { AIAssistantService } from '../src/services/aiAssistantService';

describe('AIAssistantService - Grounded Retrieval & Fallback', () => {
  it('retrieves relevant verified scholarship context and citations for query', () => {
    const context = AIAssistantService.retrieveGroundedContext('documents for SC post matric');
    expect(context.matchedScholarships.length).toBeGreaterThan(0);
    expect(context.citations.length).toBeGreaterThan(0);
    expect(context.citations[0].official_url).toMatch(/^https?:\/\//);
  });

  it('generates grounded response with verified citations in English', async () => {
    const res = await AIAssistantService.askAssistant('What is the deadline for Pragati scholarship?', [], 'en');
    expect(res.language).toBe('en');
    expect(res.content).toBeTruthy();
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.content).toContain('Pragati');
  });

  it('generates grounded response in Telugu when selected', async () => {
    const res = await AIAssistantService.askAssistant('స్కాలర్‌షిప్ పత్రాలు ఏమిటి?', [], 'te');
    expect(res.language).toBe('te');
    expect(res.content).toBeTruthy();
    expect(res.citations.length).toBeGreaterThan(0);
  });

  it('generates grounded response in Hindi when selected', async () => {
    const res = await AIAssistantService.askAssistant('छात्रवृत्ति के लिए कौन से दस्तावेज चाहिए?', [], 'hi');
    expect(res.language).toBe('hi');
    expect(res.content).toBeTruthy();
    expect(res.citations.length).toBeGreaterThan(0);
  });
});
