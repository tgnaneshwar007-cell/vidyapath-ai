import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/locales/LanguageContext';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X, ArrowUpRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: t.nav.scholarships, href: '/scholarships' },
    { name: t.nav.eligibility, href: '/eligibility' },
    { name: t.nav.assistant, href: '/assistant', highlight: true },
    { name: t.nav.dashboard, href: '/dashboard' },
    { name: t.nav.about, href: '/about' },
  ];

  const languages: { code: Language; label: string; sub: string }[] = [
    { code: 'en', label: 'English', sub: 'Default' },
    { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
    { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border/70 bg-brand-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark & Emblem */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-brand-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 rounded"
          aria-label="VidyaPath AI Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-black text-brand-orange shadow-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="h-5 w-5">
              <path d="M7 23L16 8L25 23" stroke="#747D87" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 17.5H21" stroke="#747D87" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="8" r="2.5" fill="#F47B20"/>
              <path d="M16 12V23" stroke="#F47B20" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-brand-black font-display flex items-center gap-1.5">
              VidyaPath <span className="text-xs px-1.5 py-0.2 rounded bg-brand-black-soft text-brand-orange font-mono font-medium">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-brand-storm-subtle text-brand-black font-semibold'
                  : 'text-brand-mutedText hover:text-brand-black hover:bg-brand-storm-subtle/50'
              } ${link.highlight ? 'flex items-center gap-1 text-brand-black font-semibold' : ''}`}
            >
              {link.name}
              {link.highlight && (
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Action Bar: Language + Sign In + CTA */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-black hover:bg-brand-storm-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              aria-label="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-brand-storm" />
              <span>{languages.find((l) => l.code === language)?.label}</span>
            </button>

            {langDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-44 rounded-lg border border-brand-border bg-brand-surface p-1 shadow-elevated z-50 animate-in fade-in-50 zoom-in-95"
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[10px] uppercase font-mono tracking-wider text-brand-mutedText font-semibold">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left transition-colors ${
                      language === l.code
                        ? 'bg-brand-storm-subtle font-semibold text-brand-black'
                        : 'text-brand-mutedText hover:bg-brand-storm-subtle/60 hover:text-brand-black'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] text-brand-storm">{l.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct CTA */}
          <Button asChild variant="primary" size="sm">
            <Link to="/scholarships" className="flex items-center gap-1">
              <span>{t.common.checkEligibility}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Language button on mobile */}
          <button
            onClick={() => {
              const order: Language[] = ['en', 'te', 'hi'];
              const next = order[(order.indexOf(language) + 1) % order.length];
              setLanguage(next);
            }}
            className="flex items-center gap-1 rounded border border-brand-border px-2 py-1 text-xs font-medium text-brand-black"
            aria-label="Change Language"
          >
            <Globe className="h-3 w-3 text-brand-storm" />
            <span>{language.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-brand-black hover:bg-brand-storm-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-brand-border bg-brand-surface px-4 pt-2 pb-6 md:hidden">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-brand-storm-subtle text-brand-black font-semibold'
                    : 'text-brand-mutedText hover:bg-brand-storm-subtle/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-brand-border flex flex-col gap-2">
              <Button asChild variant="primary" className="w-full">
                <Link to="/scholarships" onClick={() => setMobileMenuOpen(false)}>
                  {t.common.checkEligibility}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
