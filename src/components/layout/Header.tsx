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
    <header className="sticky top-0 z-40 w-full border-b border-brand-border/60 bg-brand-surface/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Official Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 rounded"
          aria-label="VidyaPath AI Home"
        >
          <img 
            src="/logo.png" 
            alt="VidyaPath AI" 
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`tap-60fps px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-brand-storm-subtle text-brand-black font-semibold'
                  : 'text-brand-mutedText hover:text-brand-black hover:bg-brand-storm-subtle/50'
              } ${link.highlight ? 'flex items-center gap-1.5 text-brand-black font-semibold' : ''}`}
            >
              {link.name}
              {link.highlight && (
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Action Bar: Language + CTA */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="tap-60fps flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-black hover:bg-brand-storm-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
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

          {/* Primary CTA with 60fps tap action */}
          <Button asChild variant="primary" size="sm" className="tap-60fps shadow-subtle">
            <Link to="/scholarships" className="flex items-center gap-1">
              <span>{t.common.checkEligibility}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => {
              const order: Language[] = ['en', 'te', 'hi'];
              const next = order[(order.indexOf(language) + 1) % order.length];
              setLanguage(next);
            }}
            className="tap-60fps flex items-center gap-1 rounded border border-brand-border px-2 py-1 text-xs font-medium text-brand-black"
            aria-label="Change Language"
          >
            <Globe className="h-3 w-3 text-brand-storm" />
            <span>{language.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="tap-60fps rounded-md p-1.5 text-brand-black hover:bg-brand-storm-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-brand-border bg-brand-surface px-4 pt-2 pb-6 md:hidden animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`tap-60fps rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-brand-storm-subtle text-brand-black font-semibold'
                    : 'text-brand-mutedText hover:bg-brand-storm-subtle/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-brand-border flex flex-col gap-2">
              <Button asChild variant="primary" className="w-full tap-60fps">
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
