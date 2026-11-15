import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShieldCheck, Mail, Lock, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode with trigger when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
        } else {
          closeAuthModal();
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName.trim());
        if (error) {
          setErrorMessage(error.message || 'Failed to create account.');
        } else {
          setSuccessMessage('Account created successfully! You are now logged in.');
          setTimeout(() => {
            closeAuthModal();
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md p-6 bg-brand-surface border border-brand-border/80 shadow-elevated rounded-2xl">
        <DialogHeader className="text-center sm:text-left space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-black text-brand-orange shadow-subtle shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-display text-brand-black">
                {mode === 'signin' ? 'Sign in to VidyaPath AI' : 'Create Student Account'}
              </DialogTitle>
              <DialogDescription className="text-xs text-brand-mutedText">
                {mode === 'signin'
                  ? 'Access your saved scholarships, tracked applications, and verified documents.'
                  : 'Start your journey with verified government scholarship matching and AI guidance.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-brand-warmWhite rounded-lg border border-brand-border/60 my-2">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`tap-60fps py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'signin'
                ? 'bg-brand-surface text-brand-black shadow-subtle border border-brand-border/40'
                : 'text-brand-mutedText hover:text-brand-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`tap-60fps py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'signup'
                ? 'bg-brand-surface text-brand-black shadow-subtle border border-brand-border/40'
                : 'text-brand-mutedText hover:text-brand-black'
            }`}
          >
            New Student
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-brand-danger animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-brand-success animate-in fade-in-50">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-black flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand-storm" />
                Full Legal Name (as per Aadhaar / Marksheet)
              </label>
              <Input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={mode === 'signup'}
                className="h-10 text-sm border-brand-border bg-white"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-black flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-brand-storm" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 text-sm border-brand-border bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-black flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-storm" />
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 text-sm border-brand-border bg-white"
            />
            {mode === 'signup' && (
              <p className="text-[11px] text-brand-mutedText">At least 6 characters</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-10 mt-2 tap-60fps flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Account' : 'Register Student Profile'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-brand-border/60">
          <p className="text-[11px] text-brand-mutedText">
            Protected by Supabase Row Level Security & 256-bit encryption.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
