import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Scholarship, SchemeType, EducationLevel } from '@/types';
import { ScholarshipRepository, ScholarshipFilters } from '@/services/scholarshipRepository';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useTranslation } from '@/locales/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  GraduationCap
} from 'lucide-react';

export const ScholarshipsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [schemeType, setSchemeType] = useState<SchemeType | 'all'>((searchParams.get('schemeType') as any) || 'all');
  const [educationLevel, setEducationLevel] = useState<EducationLevel | 'all'>((searchParams.get('educationLevel') as any) || 'all');
  const [selectedState, setSelectedState] = useState<string>(searchParams.get('state') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedGender, setSelectedGender] = useState<string>(searchParams.get('gender') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closing_soon' | 'closed'>((searchParams.get('status') as any) || 'all');
  const [sortBy, setSortBy] = useState<'verified_desc' | 'deadline_asc' | 'amount_desc' | 'title_asc'>('verified_desc');
  const [page, setPage] = useState(1);

  // Mobile drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data States
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const availableStates = ScholarshipRepository.getAvailableStates();

  const fetchScholarships = async () => {
    setLoading(true);
    const filters: ScholarshipFilters = {
      search: searchQuery,
      schemeType,
      educationLevel,
      state: selectedState,
      category: selectedCategory,
      gender: selectedGender,
      status: selectedStatus,
      sortBy,
      page,
      pageSize: 9,
    };

    const res = await ScholarshipRepository.getScholarships(filters);
    setScholarships(res.data);
    setTotalCount(res.totalCount);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchScholarships();
  }, [searchQuery, schemeType, educationLevel, selectedState, selectedCategory, selectedGender, selectedStatus, sortBy, page]);

  // Synchronize URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (schemeType !== 'all') params.set('schemeType', schemeType);
    if (educationLevel !== 'all') params.set('educationLevel', educationLevel);
    if (selectedState !== 'all') params.set('state', selectedState);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedGender !== 'all') params.set('gender', selectedGender);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    setSearchParams(params, { replace: true });
  }, [searchQuery, schemeType, educationLevel, selectedState, selectedCategory, selectedGender, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSchemeType('all');
    setEducationLevel('all');
    setSelectedState('all');
    setSelectedCategory('all');
    setSelectedGender('all');
    setSelectedStatus('all');
    setSortBy('verified_desc');
    setPage(1);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    schemeType !== 'all' || 
    educationLevel !== 'all' || 
    selectedState !== 'all' || 
    selectedCategory !== 'all' || 
    selectedGender !== 'all' || 
    selectedStatus !== 'all';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-brand-black font-display">
            {t.nav.scholarships}
          </h1>
          <p className="mt-1 text-sm text-brand-mutedText max-w-2xl">
            Explore verified Central Government, State, and Private scholarships for Indian students. Sourced directly from official gazettes and portals.
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-mono text-brand-storm-dark bg-brand-storm-subtle px-3 py-1.5 rounded-md self-start md:self-end">
          <span>{totalCount} Verified Schemes Found</span>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-brand-border bg-brand-surface p-5 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-black">
                <SlidersHorizontal className="h-4 w-4 text-brand-orange" />
                <span>{t.common.filters}</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs text-brand-mutedText hover:text-brand-orange transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{t.common.resetFilters}</span>
                </button>
              )}
            </div>

            <div className="mt-5 space-y-5 text-sm">
              {/* Scheme Type */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                  Scheme Type
                </label>
                <select
                  value={schemeType}
                  onChange={(e) => { setSchemeType(e.target.value as any); setPage(1); }}
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-black focus:outline-none focus:border-brand-storm"
                >
                  <option value="all">All Scheme Types</option>
                  <option value="central">Central Government</option>
                  <option value="state">State Government</option>
                  <option value="private">Private / Foundation</option>
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => { setEducationLevel(e.target.value as any); setPage(1); }}
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-black focus:outline-none focus:border-brand-storm"
                >
                  <option value="all">All Levels</option>
                  <option value="class_9_10">Class 9 - 10</option>
                  <option value="class_11_12">Class 11 - 12 (Intermediate)</option>
                  <option value="diploma">Diploma / Polytechnic</option>
                  <option value="undergraduate">Undergraduate Degree (B.Tech, B.Sc, B.Com)</option>
                  <option value="postgraduate">Postgraduate (M.Tech, M.Sc, MBA)</option>
                  <option value="phd">Doctoral / PhD</option>
                </select>
              </div>

              {/* State / Domicile */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                  State of Domicile
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => { setSelectedState(e.target.value); setPage(1); }}
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-black focus:outline-none focus:border-brand-storm"
                >
                  <option value="all">All India / Any State</option>
                  {availableStates.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Social Category */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-black focus:outline-none focus:border-brand-storm"
                >
                  <option value="all">All Categories</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="Minority">Minority (Muslim, Christian, Sikh, etc.)</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => { setSelectedGender(e.target.value); setPage(1); }}
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-black focus:outline-none focus:border-brand-storm"
                >
                  <option value="all">All Genders</option>
                  <option value="female">Girls / Female Only</option>
                  <option value="male">Male</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-2">
                  Application Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value as any); setPage(1); }}
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-black focus:outline-none focus:border-brand-storm"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Currently Open</option>
                  <option value="closing_soon">Closing Soon (≤ 15 days)</option>
                  <option value="closed">Closed for this Cycle</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Column */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-storm" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder={t.common.searchPlaceholder}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-storm hover:text-brand-black"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden flex items-center gap-1.5"
                onClick={() => setMobileFilterOpen(true)}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </Button>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-brand-mutedText hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-md border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-black focus:outline-none"
                >
                  <option value="verified_desc">Recently Verified</option>
                  <option value="deadline_asc">Deadline (Soonest)</option>
                  <option value="amount_desc">Award Amount (High to Low)</option>
                  <option value="title_asc">Title (A - Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-brand-mutedText">Active filters:</span>
              {schemeType !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded bg-brand-storm-subtle px-2 py-0.5 text-brand-storm-dark">
                  Type: {schemeType}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSchemeType('all')} />
                </span>
              )}
              {educationLevel !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded bg-brand-storm-subtle px-2 py-0.5 text-brand-storm-dark">
                  Level: {educationLevel.replace(/_/g, ' ')}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setEducationLevel('all')} />
                </span>
              )}
              {selectedState !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded bg-brand-storm-subtle px-2 py-0.5 text-brand-storm-dark">
                  State: {selectedState}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedState('all')} />
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded bg-brand-storm-subtle px-2 py-0.5 text-brand-storm-dark">
                  Category: {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </span>
              )}
              {selectedGender !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded bg-brand-storm-subtle px-2 py-0.5 text-brand-storm-dark">
                  Gender: {selectedGender}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedGender('all')} />
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-brand-orange hover:underline ml-1 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Scholarship Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCard key={`skel-${idx}`} />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="rounded-xl border border-brand-border bg-brand-surface p-12 text-center shadow-card">
              <GraduationCap className="h-10 w-10 text-brand-storm mx-auto mb-3" />
              <h3 className="text-base font-semibold text-brand-black">
                {t.common.noResults}
              </h3>
              <p className="mt-1 text-sm text-brand-mutedText max-w-md mx-auto">
                {t.common.noResultsSuggestion}
              </p>
              <Button onClick={handleResetFilters} variant="outline" size="sm" className="mt-4">
                {t.common.resetFilters}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-brand-border pt-4">
              <span className="text-xs text-brand-mutedText">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-brand-black/60 lg:hidden">
          <div className="ml-auto w-full max-w-xs bg-brand-surface p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <span className="font-semibold text-brand-black">{t.common.filters}</span>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="h-5 w-5 text-brand-black" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-brand-storm-dark mb-1">
                  Scheme Type
                </label>
                <select
                  value={schemeType}
                  onChange={(e) => setSchemeType(e.target.value as any)}
                  className="w-full rounded border border-brand-border p-2 text-xs"
                >
                  <option value="all">All Types</option>
                  <option value="central">Central Government</option>
                  <option value="state">State Government</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-storm-dark mb-1">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded border border-brand-border p-2 text-xs"
                >
                  <option value="all">All India</option>
                  {availableStates.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-storm-dark mb-1">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value as any)}
                  className="w-full rounded border border-brand-border p-2 text-xs"
                >
                  <option value="all">All Levels</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="class_11_12">Class 11 - 12</option>
                  <option value="diploma">Diploma</option>
                  <option value="postgraduate">Postgraduate</option>
                </select>
              </div>

              <div className="pt-4 border-t border-brand-border flex gap-2">
                <Button variant="primary" className="flex-1" onClick={() => setMobileFilterOpen(false)}>
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
