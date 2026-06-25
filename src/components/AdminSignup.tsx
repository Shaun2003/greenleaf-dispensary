import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Mail, Key, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface AdminSignupProps {
  onSuccess: (user: UserType) => void;
  onCancel: () => void;
}

export default function AdminSignup({ onSuccess, onCancel }: AdminSignupProps) {
  const [name, setName] = useState('Grace Leaf (Admin)');
  const [email, setEmail] = useState('admin@greenleaf.com');
  const [password, setPassword] = useState('admin123');
  const [securityKey, setSecurityKey] = useState('LEAF_ADMIN_2026');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAutofill = () => {
    setName('Grace Leaf (Admin)');
    setEmail('admin@greenleaf.com');
    setPassword('admin123');
    setSecurityKey('LEAF_ADMIN_2026');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Validate all fields
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please provide all administrative onboarding fields.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Validate email is admin-related
    const emailLower = email.toLowerCase();
    if (!emailLower.includes('admin') && !emailLower.endsWith('@greenleaf.com')) {
      setError('Admin registration requires an administrative email (containing "admin" or "@greenleaf.com").');
      setLoading(false);
      return;
    }

    const keyUpper = securityKey.trim().toUpperCase();
    if (keyUpper !== 'GREENADMIN420' && keyUpper !== 'LEAF_ADMIN_2026') {
      setError('Invalid security master key or Admin Access Code.');
      setLoading(false);
      return;
    }

    try {
      // 1. Try registering as admin (pass adminCode in body!)
      const regResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          password: password.trim(),
          address: 'GreenLeaf HQ Admin Division',
          adminCode: securityKey.trim()
        }),
      });

      let adminData: UserType | null = null;

      if (regResponse.ok) {
        const data = await regResponse.json();
        adminData = data.user;
      } else {
        // 2. If already registered, try logging in (pass adminCode in body!)
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            adminCode: securityKey.trim()
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          adminData = data.user;
        } else {
          const errData = await loginResponse.json();
          throw new Error(errData.error || 'State credential verification failed.');
        }
      }

      if (adminData) {
        if (adminData.role !== 'admin') {
          throw new Error('This account exists but is not registered with administrative privileges.');
        }
        setSuccessMsg('Administrative key accepted. Activating secure control panel...');
        setTimeout(() => {
          onSuccess(adminData!);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred during administrative initialization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4 sm:px-6">
      <div className="glass-light rounded-[32px] overflow-hidden shadow-xl text-brand-dark">
        {/* Compliance Header Accent Banner */}
        <div className="bg-[#1e251c] text-white p-6 text-center space-y-1 relative">
          <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-[#8F9A7D] uppercase font-bold px-2 py-0.5 border border-[#8F9A7D]/30 rounded-md">
            SECURE PORT
          </div>
          <div className="w-12 h-12 bg-brand-green/20 border border-brand-green/40 text-brand-green rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-black uppercase tracking-tight text-white">
            Admin Privilege Verification
          </h2>
          <p className="text-xs text-[#C7D1C3] font-mono tracking-wide uppercase">
            State-Licensed Cannabis Compliance Portal
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-[#F5F5F0] border border-brand-border p-4 rounded-2xl text-xs space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 text-brand-green font-bold">
              <Sparkles className="w-4 h-4 text-brand-green shrink-0 animate-pulse" />
              <span>Sandbox Evaluator Information</span>
            </div>
            <p className="text-brand-dark/80">
              To evaluate the GreenLeaf logistics and catalog admin control center, use the pre-filled credentials below or click the auto-fill button.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-brand-border/60">
              <span className="font-mono text-[10px] text-brand-muted-green font-bold">ADMIN ACCESS CODE: LEAF_ADMIN_2026</span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-green hover:text-brand-green-dark cursor-pointer underline decoration-dotted"
              >
                Reset Autofill
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-muted-green uppercase tracking-wider font-mono flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-green" /> Admin Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grace Leaf"
                className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs text-brand-dark font-medium"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-muted-green uppercase tracking-wider font-mono flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-brand-green" /> Licensed Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@greenleaf.com"
                className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs text-brand-dark font-mono font-medium"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-muted-green uppercase tracking-wider font-mono flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-brand-green" /> Console Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs text-brand-dark font-mono font-medium"
                required
              />
            </div>

            {/* Security Key */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-muted-green uppercase tracking-wider font-mono flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-brand-green" /> Admin Access security code
              </label>
              <input
                type="text"
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                placeholder="LEAF_ADMIN_2026"
                className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl text-xs text-brand-dark font-mono font-bold tracking-widest text-center"
                required
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span className="font-mono font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-brand-green flex items-start gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-brand-green animate-bounce" />
                <span className="font-sans font-semibold leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={loading || successMsg !== ''}
                className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider font-sans cursor-pointer transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-brand-muted-green/60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Initialize Secure Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 bg-transparent hover:bg-brand-bg text-brand-muted-green hover:text-brand-dark text-xs font-mono uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
              >
                Cancel & Go Back to Shop
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
