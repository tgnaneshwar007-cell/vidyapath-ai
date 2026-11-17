import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/locales/LanguageContext';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { Scholarship } from '@/types';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  FileText, 
  LayoutDashboard, 
  Bookmark, 
  Globe, 
  X, 
  CornerDownLeft, 
  Layers
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ScholarshipRepository.getScholarshipsList({ pageSize: 30 }).then(setScholarships);
  }, []);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Command items collection
  const staticItems: CommandItem[] = [
    {
      id: 'nav-scholarships',
      title: t.nav.scholarships,
      category: 'Navigation',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => navigate('/scholarships'),
    },
    {
      id: 'nav-eligibility',
      title: t.nav.eligibility,
      category: 'Intelligence',
      icon: <Sparkles className="h-4 w-4 text-brand-orange" />,
      action: () => navigate('/eligibility'),
    },
    {
      id: 'nav-assistant',
      title: t.nav.assistant,
      category: 'AI Guidance',
      icon: <Sparkles className="h-4 w-4 text-brand-orange" />,
      action: () => navigate('/assistant'),
    },
    {
      id: 'nav-documents',
      title: 'Official Document Checklist',
      category: 'Verification',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/documents'),
    },
    {
      id: 'nav-dashboard',
      title: t.nav.dashboard,
      category: 'Navigation',
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-saved',
      title: 'Saved Scholarships',
      category: 'Bookmarks',
      icon: <Bookmark className="h-4 w-4" />,
      action: () => navigate('/saved-scholarships'),
    },
    {
      id: 'lang-en',
      title: 'Switch language to English',
      category: 'Language',
      icon: <Globe className="h-4 w-4" />,
      action: () => setLanguage('en'),
    },
    {
      id: 'lang-te',
      title: 'భాషను తెలుగులోకి మార్చండి (Telugu)',
      category: 'Language',
      icon: <Globe className="h-4 w-4" />,
      action: () => setLanguage('te'),
    },
    {
      id: 'lang-hi',
      title: 'भाषा को हिंदी में बदलें (Hindi)',
      category: 'Language',
      icon: <Globe className="h-4 w-4" />,
      action: () => setLanguage('hi'),
    },
  ];

  // Filter items based on query
  const filteredScholarships: CommandItem[] = query.trim()
    ? scholarships
        .filter((s) => {
          const q = query.toLowerCase();
          return (
            s.title.en.toLowerCase().includes(q) ||
            s.title.te.toLowerCase().includes(q) ||
            s.title.hi.toLowerCase().includes(q) ||
            s.provider.en.toLowerCase().includes(q) ||
            s.slug.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
        .map((s) => ({
          id: `sch-${s.id}`,
          title: String(s.title[language] || s.title.en),
          subtitle: String(s.provider[language] || s.provider.en),
          category: 'Scholarships',
          icon: <Layers className="h-4 w-4 text-brand-orange" />,
          action: () => navigate(`/scholarships/${s.slug}`),
        }))
    : [];

  const filteredStatic = query.trim()
    ? staticItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : staticItems;

  const allItems: CommandItem[] = [...filteredScholarships, ...filteredStatic];

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/45 backdrop-blur-sm animate-in fade-in-50"
      onClick={() => setIsOpen(false)}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-brand-border/90 bg-white shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-brand-border/80">
          <Search className="h-4 w-4 text-brand-storm shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Type a command or search scholarships, states, schemes..."
            className="w-full px-3 py-3.5 text-sm bg-transparent text-brand-black placeholder:text-brand-mutedText focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-brand-storm hover:text-brand-black rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono text-brand-mutedText bg-brand-storm-subtle ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-brand-border/40">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-brand-mutedText">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {allItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-black text-white'
                        : 'text-brand-black hover:bg-brand-storm-subtle/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 ${isSelected ? 'text-brand-orange' : 'text-brand-storm'}`}>
                        {item.icon}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold truncate">{item.title}</p>
                        {'subtitle' in item && item.subtitle && (
                          <p className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-brand-mutedText'}`}>
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/15 text-white' : 'bg-brand-storm-subtle text-brand-mutedText'
                      }`}>
                        {item.category}
                      </span>
                      {isSelected && <CornerDownLeft className="h-3 w-3 text-brand-orange" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-brand-warmWhite border-t border-brand-border/80 text-[10.5px] font-mono text-brand-mutedText">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-brand-border/60 px-1 py-0.5 rounded">↑</kbd> <kbd className="bg-brand-border/60 px-1 py-0.5 rounded">↓</kbd> navigate</span>
            <span><kbd className="bg-brand-border/60 px-1 py-0.5 rounded">↵</kbd> select</span>
          </div>
          <span>VidyaPath Intelligence</span>
        </div>
      </div>
    </div>
  );
};
