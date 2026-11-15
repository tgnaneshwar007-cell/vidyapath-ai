import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/locales/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X, ArrowUpRight, User, LogOut, ShieldAlert } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const { user, profile, isAdmin, signOut, openAuthModal } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full border-b border-brand-border/60 bg-white/80 backdrop-blur-xl transition-all shadow-subtle">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Emblem & Typography */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 rounded-lg"
          aria-label="VidyaPath AI Home"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-brand-black shadow-subtle border border-brand-border/60 shrink-0">
            <img 
              src="/logo.png" 
              alt="VidyaPath AI Emblem" 
              className="h-full w-full object-cover scale-110"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-brand-black font-display flex items-center gap-1.5 leading-none">
              VidyaPath <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-black text-brand-orange font-mono font-semibold">AI</span>
            </span>
            <span className="text-[9.5px] text-brand-mutedText font-mono tracking-wider uppercase mt-1">Scholarship Intelligence</span>
          </div>
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
          {isAdmin && (
            <Link
              to="/admin"
              className={`tap-60fps px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-brand-black text-white'
                  : 'bg-brand-black/5 text-brand-black hover:bg-brand-black hover:text-white'
              }`}
            >
              <ShieldAlert className="h-3 w-3 text-brand-orange" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Language Selector */}
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

          {/* User Auth or Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="tap-60fps flex items-center gap-2 rounded-lg border border-brand-border/80 bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-black hover:bg-brand-storm-subtle"
              >
                <div className="h-6 w-6 rounded-full bg-brand-black text-white flex items-center justify-center font-bold text-[10px]">
                  {(profile?.full_name || user.email || 'S')[0].toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className="text-[9px] bg-brand-black text-brand-orange px-1 py-0.5 rounded font-mono font-semibold">
                    ADMIN
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-brand-border bg-brand-surface p-1.5 shadow-elevated z-50 animate-in fade-in-50 zoom-in-95"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-2.5 py-2 border-b border-brand-border/60 mb-1">
                    <p className="text-xs font-semibold text-brand-black truncate">
                      {profile?.full_name || 'Student Candidate'}
                    </p>
                    <p className="text-[11px] text-brand-mutedText truncate font-mono">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-brand-black hover:bg-brand-storm-subtle"
                  >
                    <User className="h-3.5 w-3.5 text-brand-storm" />
                    <span>Student Profile</span>
                  </Link>

                  <Link
                    to="/saved"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-brand-black hover:bg-brand-storm-subtle"
                  >
                    <span>Saved Scholarships</span>
                  </Link>

                  <Link
                    to="/applications"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-brand-black hover:bg-brand-storm-subtle"
                  >
                    <span>My Applications</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-brand-black hover:bg-brand-storm-subtle font-semibold"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-brand-orange" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="pt-1 mt-1 border-t border-brand-border/60">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-brand-danger hover:bg-red-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAuthModal('signin')}
              className="tap-60fps text-xs h-8 border-brand-border hover:bg-brand-storm-subtle"
            >
              Sign In
            </Button>
          )}

          {/* Primary CTA */}
          <Button asChild variant="primary" size="sm" className="tap-60fps shadow-subtle">
            <Link to="/scholarships" className="flex items-center gap-1">
              <span>{t.common.checkEligibility}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
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

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="tap-60fps rounded-md px-3 py-2 text-sm font-semibold text-brand-black bg-brand-storm-subtle flex items-center gap-2"
              >
                <ShieldAlert className="h-4 w-4 text-brand-orange" />
                Admin Dashboard
              </Link>
            )}

            <div className="pt-3 border-t border-brand-border flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-brand-warmWhite">
                  <div>
                    <p className="text-xs font-semibold text-brand-black">
                      {profile?.full_name || user.email}
                    </p>
                    <p className="text-[10px] text-brand-mutedText">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="text-brand-danger text-xs h-7"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="w-full text-xs h-9"
                >
                  Sign In
                </Button>
              )}

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
