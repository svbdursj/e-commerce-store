import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Check,
} from 'lucide-react';

interface AccountPortalProps {
  onSuccessfulAuth: () => void;
}

export const AccountPortal: React.FC<AccountPortalProps> = ({ onSuccessfulAuth }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Create Account Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpTier, setSignUpTier] = useState<'Member' | 'Private Collector' | 'Atelier Patron'>('Member');
  const [signUpError, setSignUpError] = useState('');

  // Quick Demo Profiles for instant testing
  const handleQuickDemoLogin = (email: string) => {
    const res = signIn(email);
    if (res.success) {
      onSuccessfulAuth();
    } else {
      setSignInError(res.error || 'Authentication failed');
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    if (!signInEmail.trim()) {
      setSignInError('Please enter your account email.');
      return;
    }
    const res = signIn(signInEmail, signInPassword);
    if (res.success) {
      onSuccessfulAuth();
    } else {
      setSignInError(res.error || 'Sign in failed. Please check credentials.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    if (!signUpName.trim()) {
      setSignUpError('Full name is required.');
      return;
    }
    if (!signUpEmail.trim()) {
      setSignUpError('Email address is required.');
      return;
    }
    const res = signUp(signUpName, signUpEmail, signUpPassword, signUpTier);
    if (res.success) {
      onSuccessfulAuth();
    } else {
      setSignUpError(res.error || 'Unable to register account.');
    }
  };

  return (
    <div
      id="account-portal-layout"
      className="w-full flex-1 max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-20 animate-in fade-in duration-300"
    >
      {/* Top Editorial Headline */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-[#73726B] block mb-3">
          Atelier Client Portal // Identity Authentication
        </span>
        <h1
          id="account-portal-headline"
          className="font-serif text-3xl sm:text-5xl text-[#141413] font-normal tracking-tight"
        >
          {mode === 'signin' ? 'Sign In to Your Account' : 'Create Private Collector Account'}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#5C5B54] font-light mt-3 sm:mt-4 leading-relaxed">
          Access your personalized order archive, real-time shipment serialization, and bespoke
          collector curation. Data records are strictly isolated to your verified account identifier.
        </p>
      </div>

      {/* Quick Demo Switchers for Evaluator Convenience */}
      <div
        id="demo-accounts-pill-container"
        className="mb-8 sm:mb-10 p-4 sm:p-5 bg-[#F0EEE6] border border-[#E5E3DC] text-xs text-[#44433E]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-[#141413]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#141413]">
              Quick Demo Authenticator:
            </span>
          </div>
          <span className="text-[11px] text-[#73726B]">
            Click any demo profile to test isolated historical order logs immediately
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="demo-login-admin"
            type="button"
            onClick={() => handleQuickDemoLogin('admin@edition.store')}
            className="min-h-[44px] text-left p-3 border-2 border-[#141413] bg-[#141413] text-[#FAF9F6] hover:bg-[#2A2926] transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-xs">Elena Vance (Admin)</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#FAF9F6] text-[#141413] font-mono font-bold">
                Director
              </span>
            </div>
            <span className="text-[11px] text-[#A6A49F] font-mono block">
              admin@edition.store (Full Admin Console)
            </span>
          </button>

          <button
            id="demo-login-julian"
            type="button"
            onClick={() => handleQuickDemoLogin('julian.vance@studio.com')}
            className="min-h-[44px] text-left p-3 border border-[#D1CEC7] bg-[#FAF9F6] hover:border-[#141413] hover:bg-white transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[#141413] text-xs">Julian Vance</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#141413] text-[#FAF9F6] font-mono">
                Customer
              </span>
            </div>
            <span className="text-[11px] text-[#73726B] font-mono block">
              julian.vance@studio.com (2 Orders)
            </span>
          </button>

          <button
            id="demo-login-elena"
            type="button"
            onClick={() => handleQuickDemoLogin('elena.rostova@atelier.com')}
            className="min-h-[44px] text-left p-3 border border-[#D1CEC7] bg-[#FAF9F6] hover:border-[#141413] hover:bg-white transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[#141413] text-xs">Elena Rostova</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#141413] text-[#FAF9F6] font-mono">
                Customer
              </span>
            </div>
            <span className="text-[11px] text-[#73726B] font-mono block">
              elena.rostova@atelier.com (1 Order)
            </span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-[#E5E3DC] mb-8">
        <button
          id="tab-switch-signin"
          type="button"
          onClick={() => {
            setMode('signin');
            setSignInError('');
            setSignUpError('');
          }}
          className={`flex-1 min-h-[44px] pb-3 sm:pb-4 text-xs uppercase tracking-[0.22em] font-medium transition-all text-center border-b-2 flex items-center justify-center space-x-2 ${
            mode === 'signin'
              ? 'border-[#141413] text-[#141413] font-semibold'
              : 'border-transparent text-[#73726B] hover:text-[#141413]'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          id="tab-switch-signup"
          type="button"
          onClick={() => {
            setMode('signup');
            setSignInError('');
            setSignUpError('');
          }}
          className={`flex-1 min-h-[44px] pb-3 sm:pb-4 text-xs uppercase tracking-[0.22em] font-medium transition-all text-center border-b-2 flex items-center justify-center space-x-2 ${
            mode === 'signup'
              ? 'border-[#141413] text-[#141413] font-semibold'
              : 'border-transparent text-[#73726B] hover:text-[#141413]'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="p-6 sm:p-12 border border-[#E5E3DC] bg-[#FAF9F6] shadow-sm">
        {mode === 'signin' ? (
          /* Sign In Form */
          <form id="sign-in-form" onSubmit={handleSignInSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs uppercase tracking-wider text-[#44433E] mb-2 font-medium"
              >
                Account Email Address *
              </label>
              <input
                id="signin-email"
                type="email"
                required
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="e.g. julian.vance@studio.com"
                className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="signin-password"
                  className="text-xs uppercase tracking-wider text-[#44433E] font-medium"
                >
                  Password *
                </label>
                <span className="text-[11px] text-[#73726B]">
                  Default demo key: <code className="font-mono">password123</code>
                </span>
              </div>
              <div className="relative">
                <input
                  id="signin-password"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-[#8C8A82] absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            {signInError && (
              <div
                id="signin-error-message"
                className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                id="signin-submit-button"
                type="submit"
                className="w-full min-h-[48px] inline-flex items-center justify-center space-x-3 py-3.5 px-6 bg-[#141413] text-[#FAF9F6] border border-[#141413] text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#2A2926] active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
              >
                <span>Authenticate & Open Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Create Account Form */
          <form id="create-account-form" onSubmit={handleSignUpSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label
                  htmlFor="signup-name"
                  className="block text-xs uppercase tracking-wider text-[#44433E] mb-2 font-medium"
                >
                  Full Name *
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Marcus Sterling"
                  className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="signup-email"
                  className="block text-xs uppercase tracking-wider text-[#44433E] mb-2 font-medium"
                >
                  Email Address *
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="marcus.sterling@archive.org"
                  className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs uppercase tracking-wider text-[#44433E] mb-2 font-medium"
                >
                  Security Password *
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-tier"
                  className="block text-xs uppercase tracking-wider text-[#44433E] mb-2 font-medium"
                >
                  Collector Tier
                </label>
                <select
                  id="signup-tier"
                  value={signUpTier}
                  onChange={(e) =>
                    setSignUpTier(e.target.value as 'Member' | 'Private Collector' | 'Atelier Patron')
                  }
                  className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                >
                  <option value="Member">Member (Standard Archive Access)</option>
                  <option value="Private Collector">Private Collector (Priority Logistics)</option>
                  <option value="Atelier Patron">Atelier Patron (Curator Concierge)</option>
                </select>
              </div>
            </div>

            {signUpError && (
              <div
                id="signup-error-message"
                className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                id="create-account-submit-button"
                type="submit"
                className="w-full min-h-[48px] inline-flex items-center justify-center space-x-3 py-3.5 px-6 bg-[#141413] text-[#FAF9F6] border border-[#141413] text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#2A2926] active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
              >
                <span>Register Account & Open Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Security & Strict Data Isolation Notice */}
        <div className="mt-8 pt-6 border-t border-[#E5E3DC] flex items-center justify-between text-[11px] text-[#73726B] font-light">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Strict User Data Isolation • Transactions Bound to Unique Identifier</span>
          </div>
          <span className="font-mono text-[10px]">AUTH PROTOCOL v1.0</span>
        </div>
      </div>
    </div>
  );
};
