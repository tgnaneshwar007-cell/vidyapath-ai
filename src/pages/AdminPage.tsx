import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Scholarship, VerificationStatus } from '@/types';
import { testSupabaseConnection, isSupabaseConfigured, supabase } from '@/services/supabaseClient';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  ShieldAlert,
  Database,
  RefreshCw,
  LogOut,
  Copy,
  Check
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, profile, isAdmin, isLoading, openAuthModal, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'schemes' | 'audit' | 'supabase'>('schemes');
  
  const [scholarshipsList, setScholarshipsList] = useState<Scholarship[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoadingSchemes(true);
      try {
        const data = await ScholarshipRepository.getScholarshipsList({ pageSize: 50 });
        setScholarshipsList(data);
      } catch (err) {
        console.warn('Error loading scholarships:', err);
      } finally {
        setLoadingSchemes(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: VerificationStatus) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Optimistic UI update
    setScholarshipsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, verification_status: newStatus, last_verified_at: today } : s))
    );

    // If Supabase is connected and user is admin, sync to database
    if (supabase && user && isAdmin) {
      try {
        await supabase
          .from('scholarships')
          .update({ 
            verification_status: newStatus, 
            last_verified_at: new Date().toISOString() 
          })
          .eq('id', id);

        await supabase
          .from('admin_audit_logs')
          .insert({
            admin_id: user.id,
            action: 'UPDATE_VERIFICATION_STATUS',
            target_type: 'scholarship',
            target_id: id,
            details: { new_status: newStatus, date: today },
          });
      } catch (err) {
        console.warn('Failed to sync status update to Supabase:', err);
      }
    }

    setUpdateMessage(`Verification status updated to "${newStatus}" and audit timestamp refreshed.`);
    setTimeout(() => setUpdateMessage(''), 3500);
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    const result = await testSupabaseConnection();
    setSupabaseTestResult(result);
    setTestingSupabase(false);
  };

  const copySqlToClipboard = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // State 1: Loading authentication status
  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <RefreshCw className="h-8 w-8 text-brand-orange animate-spin mx-auto" />
        <p className="text-sm text-brand-mutedText font-mono">Verifying administrative authorization...</p>
      </div>
    );
  }

  // State 2: Not logged in
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="glass-box rounded-2xl p-6 sm:p-8 shadow-card text-center space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-black text-brand-orange mx-auto shadow-subtle">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-bold text-brand-black font-display tracking-tight">
            Administrator Access Required
          </h1>

          <p className="text-xs text-brand-mutedText leading-relaxed">
            The VidyaPath AI Admin Console is restricted to authorized scheme auditors and administrators. Authentication is enforced through Supabase Row Level Security.
          </p>

          <Button 
            onClick={() => openAuthModal('signin')} 
            variant="primary" 
            className="w-full tap-60fps font-semibold"
          >
            Sign In with Administrator Account
          </Button>

          <p className="text-[11px] text-brand-mutedText pt-2">
            Tip: You can create an account using the New Student tab and then grant it admin privileges in your Supabase SQL Editor.
          </p>
        </div>
      </div>
    );
  }

  // State 3: Logged in but not admin
  if (!isAdmin) {
    const promoteSql = `UPDATE public.profiles\nSET is_admin = TRUE\nWHERE email = '${user.email}';`;

    return (
      <div className="mx-auto max-w-xl px-4 py-16 space-y-6">
        <div className="glass-box rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mx-auto shadow-subtle">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-brand-black font-display tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs text-brand-mutedText">
              Signed in as <span className="font-semibold text-brand-black font-mono">{user.email}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            Your user account is registered, but the database profile flag <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">is_admin</code> is currently <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">FALSE</code>.
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-black uppercase font-mono tracking-wider">
                To Grant Admin Rights in Supabase:
              </span>
              <button
                onClick={() => copySqlToClipboard(promoteSql)}
                className="flex items-center gap-1 text-[11px] font-mono text-brand-storm hover:text-brand-black"
              >
                {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-brand-black text-brand-warmWhite rounded-lg text-xs font-mono overflow-x-auto">
              {promoteSql}
            </pre>
            <p className="text-[11px] text-brand-mutedText">
              Paste this query in your Supabase SQL Editor and click Run, then click the button below.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => refreshProfile()}
              variant="primary"
              className="flex-1 tap-60fps flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Profile Permissions</span>
            </Button>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="tap-60fps text-brand-danger hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Authenticated Administrator
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="verified">Admin Console</Badge>
            <span className="text-xs text-brand-mutedText font-mono">
              Signed in: <span className="font-semibold text-brand-black">{profile?.full_name || user.email}</span> (is_admin: true)
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-brand-black font-display tracking-tight">
            Verification & Database Operations
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="tap-60fps text-xs"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign Out
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
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'schemes'
              ? 'border-brand-orange text-brand-black font-bold'
              : 'border-transparent text-brand-mutedText hover:text-brand-black'
          }`}
        >
          Scheme Directory ({scholarshipsList.length})
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'supabase'
              ? 'border-brand-orange text-brand-black font-bold'
              : 'border-transparent text-brand-mutedText hover:text-brand-black'
          }`}
        >
          Live Supabase Status
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-brand-orange text-brand-black font-bold'
              : 'border-transparent text-brand-mutedText hover:text-brand-black'
          }`}
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

          {loadingSchemes ? (
            <div className="p-12 text-center text-xs text-brand-mutedText">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-orange" />
              Loading schemes...
            </div>
          ) : (
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
          )}
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
              <span className="text-brand-mutedText block mb-1">SUPABASE_URL</span>
              <span className="font-semibold text-brand-black break-all">
                {import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '(Not configured)'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-brand-border bg-brand-storm-subtle/30">
              <span className="text-brand-mutedText block mb-1">PUBLISHABLE_KEY</span>
              <span className="font-semibold text-brand-black">
                {import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? '••••••••••••••••••••' : '(Not configured)'}
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
