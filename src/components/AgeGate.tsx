import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Flame } from 'lucide-react';

interface AgeGateProps {
  onVerified: () => void;
}

export default function AgeGate({ onVerified }: AgeGateProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Check if already verified
    const isVerified = localStorage.getItem('greenleaf_age_verified');
    if (isVerified === 'true') {
      onVerified();
    }
  }, [onVerified]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2026) {
      setError('Please enter a valid birthdate.');
      return;
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(y, m - 1, d);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 21) {
      localStorage.setItem('greenleaf_age_verified', 'true');
      onVerified();
    } else {
      setAccessDenied(true);
      setError('Access Denied. You must be 21 years of age or older to enter this site.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg text-brand-dark p-4 font-sans selection:bg-brand-green selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-brand-green/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white border border-brand-border shadow-xl text-center">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-green flex items-center justify-center mb-4 shadow-md">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-brand-dark">
            GREENLEAF <span className="text-brand-green">DISPENSARY</span>
          </h1>
          <p className="compliance-badge text-brand-green mt-1 font-semibold font-mono text-[10px]">Premium Legal Cannabis Co.</p>
        </div>

        {!accessDenied ? (
          <>
            <p className="text-brand-dark/80 text-sm mb-6 leading-relaxed font-sans">
              Welcome to GreenLeaf. This website contains products, information, and marketing materials related to legal adult-use cannabis. You must be <span className="text-brand-green font-semibold">21 or older</span> to enter.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <label className="block text-left text-xs font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                Enter Your Date of Birth
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="MM"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none text-center font-mono text-lg text-brand-dark"
                  required
                />
                <input
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none text-center font-mono text-lg text-brand-dark"
                  required
                />
                <input
                  type="number"
                  placeholder="YYYY"
                  min="1900"
                  max="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none text-center font-mono text-lg text-brand-dark"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark active:bg-brand-green-dark text-white font-semibold rounded-lg transition-colors shadow-md text-sm font-sans tracking-wider cursor-pointer"
              >
                VERIFY AGE & ENTER
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-brand-border text-[10px] text-brand-muted-green leading-relaxed font-mono">
              By clicking ENTER you agree to our Terms of Service & Privacy Policy. We use cookies and storage to securely verify and remember your age.
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-serif text-lg font-bold text-red-600">ACCESS RESTRICTED</h3>
            <p className="text-brand-muted-green text-sm leading-relaxed font-sans">
              You must be of legal age (21 years or older) to view the products and services at GreenLeaf Dispensary.
            </p>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-xs text-red-500 font-mono text-left">
              WARNING: Legal compliance strictly enforced. Unauthorized underage access attempts may be logged.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
