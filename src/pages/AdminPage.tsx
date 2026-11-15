import React, { useState } from 'react';
import { VERIFIED_SCHOLARSHIPS } from '@/data/verifiedScholarships';
import { Scholarship, VerificationStatus } from '@/types';
import { testSupabaseConnection, isSupabaseConfigured } from '@/services/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Lock,
  Database,
  RefreshCw
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'schemes' | 'audit' | 'supabase'>('schemes');
  
  const [scholarshipsList, setScholarshipsList] = useState<Scholarship[]>(VERIFIED_SCHOLARSHIPS);
  const [updateMessage, setUpdateMessage] = useState('');
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === 'vidyapath-admin-2026' || passphrase === (import.meta.env.VITE_ADMIN_SECRET || 'admin')) {
      setIsAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrative authorization credentials.');
    }
  };

  const handleUpdateStatus = (id: string, newStatus: VerificationStatus) => {
    setScholarshipsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, verification_status: newStatus, last_verified_at: new Date().toISOString().split('T')[0] } : s))
    );
    setUpdateMessage(`Verification status updated to "${newStatus}" and audit timestamp refreshed.`);
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    const result = await testSupabaseConnection();
    setSupabaseTestResult(result);
    setTestingSupabase(false);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="glass-box rounded-2xl p-6 sm:p-8 shadow-card text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-black text-brand-orange mx-auto shadow-subtle">
            <Lock className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-bold text-brand-black font-display tracking-tight">
            Admin Authorization
          </h1>

          <p className="text-xs text-brand-mutedText">
            Enter administrative passkey to access scheme verification records, audit logs, and Supabase database controls.
          </p>

          {authError && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs text-brand-danger font-medium border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                Admin Passkey
              </label>
              <Input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter passkey (e.g. vidyapath-admin-2026)"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full tap-60fps">
              Authenticate as Administrator
            </Button>
          </form>

          <p className="text-[11px] text-brand-mutedText pt-2">
            Tip for development: Use <code className="bg-brand-storm-subtle px-1.5 py-0.5 rounded font-mono text-brand-black">vidyapath-admin-2026</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="verified">Admin Console</Badge>
            <span className="text-xs text-brand-mutedText font-mono">Role: Verified Scheme Auditor</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-brand-black font-display tracking-tight">
            Verification & Database Operations
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdminAuthenticated(false)}
            className="tap-60fps"
          >
            Lock Session
          </Button>
        </div>
      </div>

      {updateMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-subtle">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{updateMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-brand-border space-x-4 text-sm font-medium">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'schemes' ? 'border-brand-orange text-brand-black font-bold' : 'border-transparent text-brand-mutedText hover:text-brand-black'}`}
        >
          Scheme Directory ({scholarshipsList.length})
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'supabase' ? 'border-brand-orange text-brand-black font-bold' : 'border-transparent text-brand-mutedText hover:text-brand-black'}`}
        >
          Live Supabase Status
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'audit' ? 'border-brand-orange text-brand-black font-bold' : 'border-transparent text-brand-mutedText hover:text-brand-black'}`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab 1: Schemes Management */}
      {activeTab === 'schemes' && (
        <div className="rounded-2xl border border-brand-border bg-white shadow-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between">
            <h2 className="text-xs font-bold text-brand-black font-display uppercase tracking-wider font-mono">
              Published & Verified Schemes
            </h2>
            <span className="text-xs text-brand-mutedText font-mono">
              All dates in Indian Standard Time (IST)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-storm-subtle/50 text-brand-mutedText font-mono uppercase border-b border-brand-border">
                <tr>
                  <th className="px-4 py-3">Scheme Title</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Verified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 text-brand-black">
                {scholarshipsList.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-storm-subtle/20 transition-colors">
                    <td className="px-4 py-3 font-semibold max-w-xs truncate">
                      {s.title.en}
                    </td>
                    <td className="px-4 py-3 text-brand-storm-dark max-w-[200px] truncate">
                      {s.provider.en}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {s.scheme_type}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.verification_status === 'verified' ? 'verified' : 'warning'}>
                        {s.verification_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-brand-mutedText">
                      {s.last_verified_at}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {s.verification_status !== 'verified' ? (
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'verified')}
                          className="px-2.5 py-1 rounded-md bg-brand-success text-white text-[11px] font-semibold tap-60fps"
                        >
                          Mark Verified
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'pending')}
                          className="px-2.5 py-1 rounded-md border border-brand-border text-brand-storm-dark hover:bg-brand-storm-subtle text-[11px] tap-60fps"
                        >
                          Mark Pending
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Live Supabase Status */}
      {activeTab === 'supabase' && (
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div>
              <h2 className="text-base font-bold text-brand-black flex items-center gap-2 font-display">
                <Database className="h-4 w-4 text-brand-orange" />
                <span>Supabase Live Cloud Integration</span>
              </h2>
              <p className="text-xs text-brand-mutedText mt-1">
                Verify and test your connection to Supabase PostgreSQL, Authentication, and Row Level Security.
              </p>
            </div>

            <Badge variant={isSupabaseConfigured ? 'verified' : 'warning'}>
              {isSupabaseConfigured ? 'Live Configured' : 'Offline / Awaiting Credentials'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-brand-border bg-brand-storm-subtle/30">
              <span className="text-brand-mutedText block mb-1">VITE_SUPABASE_URL</span>
              <span className="font-semibold text-brand-black break-all">
                {import.meta.env.VITE_SUPABASE_URL || '(Not set in .env)'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-brand-border bg-brand-storm-subtle/30">
              <span className="text-brand-mutedText block mb-1">VITE_SUPABASE_ANON_KEY</span>
              <span className="font-semibold text-brand-black">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••••••••••••••' : '(Not set in .env)'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-brand-border/80 bg-brand-warmWhite space-y-3">
            <h3 className="font-bold text-xs uppercase font-mono text-brand-black">
              Test Connection Probe
            </h3>
            <p className="text-xs text-brand-mutedText">
              Click below to execute a live probe against your Supabase project tables.
            </p>

            <Button
              onClick={handleTestSupabase}
              disabled={testingSupabase}
              variant="secondary"
              size="sm"
              className="tap-60fps flex items-center gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
              <span>Test Live Supabase Connection</span>
            </Button>

            {supabaseTestResult && (
              <div
                className={`mt-3 p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                  supabaseTestResult.connected
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
              >
                <span>{supabaseTestResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold text-brand-black font-display pb-3 border-b border-brand-border">
            System & Editorial Audit Trail
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl border border-brand-border bg-brand-warmWhite/50 flex items-center justify-between">
              <div>
                <span className="font-semibold text-brand-black">[VERIFY_SCHEME]</span>{' '}
                <span className="text-brand-storm-dark">Post-Matric SC Scheme guidelines audited against 2026 gazette.</span>
              </div>
              <span className="text-brand-mutedText text-[11px]">2026-10-15 14:30 IST</span>
            </div>

            <div className="p-3.5 rounded-xl border border-brand-border bg-brand-warmWhite/50 flex items-center justify-between">
              <div>
                <span className="font-semibold text-brand-black">[UPDATE_DEADLINE]</span>{' '}
                <span className="text-brand-storm-dark">AICTE Pragati confirmed deadline updated to 2026-12-31.</span>
              </div>
              <span className="text-brand-mutedText text-[11px]">2026-10-18 11:15 IST</span>
            </div>

            <div className="p-3.5 rounded-xl border border-brand-border bg-brand-warmWhite/50 flex items-center justify-between">
              <div>
                <span className="font-semibold text-brand-black">[VERIFY_PORTAL]</span>{' '}
                <span className="text-brand-storm-dark">Jnanabhumi AP server handshake verified. Income cap locked at ₹2.5L.</span>
              </div>
              <span className="text-brand-mutedText text-[11px]">2026-10-25 09:45 IST</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
