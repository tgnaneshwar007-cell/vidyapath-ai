import { describe, it, expect } from 'vitest';
import { en } from '../src/locales/en';
import { te } from '../src/locales/te';
import { hi } from '../src/locales/hi';

describe('Multilingual Localization Integrity', () => {
  it('ensures all top-level sections exist in English, Telugu, and Hindi', () => {
    const keys = Object.keys(en);
    expect(Object.keys(te)).toEqual(keys);
    expect(Object.keys(hi)).toEqual(keys);
  });

  it('ensures all common UI tokens are defined in Telugu without empty values', () => {
    Object.entries(te.common).forEach(([key, val]) => {
      expect(val, `Missing Telugu translation for common.${key}`).toBeTruthy();
    });
  });

  it('ensures all common UI tokens are defined in Hindi without empty values', () => {
    Object.entries(hi.common).forEach(([key, val]) => {
      expect(val, `Missing Hindi translation for common.${key}`).toBeTruthy();
    });
  });

  it('verifies core product promise across languages', () => {
    expect(en.common.tagline).toBe('Find the support that moves you forward.');
    expect(te.common.tagline).toBeTruthy();
    expect(hi.common.tagline).toBeTruthy();
  });
});
