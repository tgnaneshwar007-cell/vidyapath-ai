import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/locales/LanguageContext';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();

  return (
    <footer className="border-t border-brand-border bg-brand-surface text-brand-black transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Column 1: Brand & Promise */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-black text-brand-orange">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="h-4 w-4">
                  <path d="M7 23L16 8L25 23" stroke="#747D87" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 17.5H21" stroke="#747D87" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="16" cy="8" r="2.5" fill="#F47B20"/>
                  <path d="M16 12V23" stroke="#F47B20" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-brand-black font-display">
                VidyaPath <span className="text-xs px-1.5 py-0.5 rounded bg-brand-black-soft text-brand-orange font-mono">AI</span>
              </span>
            </div>

            <p className="mt-3 text-sm text-brand-mutedText leading-relaxed max-w-sm">
              {t.common.tagline} Verified Indian scholarship intelligence, deterministic eligibility evaluations, and multilingual application guidance.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-brand-storm-dark">
              <ShieldCheck className="h-4 w-4 text-brand-success" />
              <span>Independent & free for students. No agent fees.</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-black font-mono">
              Directory
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/scholarships" className="text-brand-mutedText hover:text-brand-black transition-colors">
                  {t.nav.scholarships}
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="text-brand-mutedText hover:text-brand-black transition-colors">
                  {t.nav.eligibility}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="text-brand-mutedText hover:text-brand-black transition-colors flex items-center gap-1">
                  <span>{t.nav.assistant}</span>
                  <span className="text-[10px] bg-brand-orange-subtle text-brand-orange font-bold px-1 rounded">RAG</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-brand-mutedText hover:text-brand-black transition-colors">
                  {t.nav.dashboard}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Official Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-black font-mono">
              Official Portals
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a 
                  href="https://scholarships.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-brand-mutedText hover:text-brand-black transition-colors flex items-center gap-1"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="h-3 w-3 text-brand-storm" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.india.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-brand-mutedText hover:text-brand-black transition-colors flex items-center gap-1"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="h-3 w-3 text-brand-storm" />
                </a>
              </li>
              <li>
                <a 
                  href="https://jnanabhumi.ap.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-brand-mutedText hover:text-brand-black transition-colors flex items-center gap-1"
                >
                  <span>AP Jnanabhumi Portal</span>
                  <ExternalLink className="h-3 w-3 text-brand-storm" />
                </a>
              </li>
              <li>
                <a 
                  href="https://telanganaepass.cgg.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-brand-mutedText hover:text-brand-black transition-colors flex items-center gap-1"
                >
                  <span>Telangana ePASS</span>
                  <ExternalLink className="h-3 w-3 text-brand-storm" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-black font-mono">
              Trust & Legal
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-brand-mutedText hover:text-brand-black transition-colors">
                  Methodology & Sources
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-brand-mutedText hover:text-brand-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-brand-mutedText hover:text-brand-black transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-brand-mutedText hover:text-brand-black transition-colors">
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Statutory Disclaimer Box */}
        <div className="mt-8 rounded-lg border border-brand-border/80 bg-brand-storm-subtle/50 p-4 text-xs text-brand-mutedText leading-relaxed">
          <p className="font-semibold text-brand-black mb-1">
            Important Information & Disclaimer:
          </p>
          <p>
            {t.common.officialDisclaimer}
          </p>
        </div>

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-brand-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-brand-mutedText">
            © {new Date().getFullYear()} VidyaPath AI. Developed for Indian students. All rights reserved.
          </p>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-brand-mutedText">Language:</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-brand-black text-white font-medium' : 'text-brand-mutedText hover:text-brand-black'}`}
            >
              English
            </button>
            <span className="text-brand-border">|</span>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-0.5 rounded ${language === 'te' ? 'bg-brand-black text-white font-medium' : 'text-brand-mutedText hover:text-brand-black'}`}
            >
              తెలుగు
            </button>
            <span className="text-brand-border">|</span>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-brand-black text-white font-medium' : 'text-brand-mutedText hover:text-brand-black'}`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
