/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { Mail, Lock, User as UserIcon, Store, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../design-system/Modal';
import { Input } from '../design-system/Input';
import { Button } from '../design-system/Button';
import { Badge } from '../design-system/Badge';
import { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'CLIENT' | 'VENDOR';
  onAuthSuccess: (token: string, user: AuthUser) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'CLIENT',
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'CLIENT' | 'VENDOR'>(initialRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setError(null);
    }
  }, [isOpen, initialMode, initialRole]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Please enter a password');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (mode === 'register' && !name.trim()) {
      setError(role === 'VENDOR' ? 'Please enter your business or contact name' : 'Please enter your full name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email: email.trim(), password }
          : { email: email.trim(), password, name: name.trim(), role };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || `Authentication failed (${response.status})`);
      }

      if (!payload.token || !payload.user) {
        throw new Error('Invalid server authentication response');
      }

      setName('');
      setEmail('');
      setPassword('');
      setError(null);

      onAuthSuccess(payload.token, payload.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      id="auth-modal"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={mode === 'login' ? 'Welcome Back to Vendoora' : 'Create Your Vendoora Account'}
      subtitle={
        mode === 'login'
          ? 'Sign in to access your bookings, orders, and saved preferences'
          : 'Join India’s premier celebration and event marketplace'
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'register' && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              I am joining as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  role === 'CLIENT'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {role === 'CLIENT' && (
                    <Badge variant="primary" size="sm">
                      Selected
                    </Badge>
                  )}
                </div>
                <span className="font-bold text-xs sm:text-sm mt-1">Customer</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  Book events, hire vendors & buy gear
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('VENDOR')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  role === 'VENDOR'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {role === 'VENDOR' && (
                    <Badge variant="primary" size="sm">
                      Selected
                    </Badge>
                  )}
                </div>
                <span className="font-bold text-xs sm:text-sm mt-1">Event Vendor</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  List services, inventory & command center
                </span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            id="auth-error-alert"
            className="flex items-start gap-2.5 p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <Input
              id="auth-name-input"
              label={role === 'VENDOR' ? 'Business or Contact Name' : 'Full Name'}
              type="text"
              placeholder={role === 'VENDOR' ? 'e.g. Royal Decorators & Events' : 'e.g. Priya Sharma'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4" />}
              autoComplete="name"
              required
            />
          )}

          <Input
            id="auth-email-input"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />

          <Input
            id="auth-password-input"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            helperText={mode === 'register' ? 'Must be at least 6 characters' : undefined}
            required
          />

          <Button
            id="auth-submit-btn"
            type="submit"
            variant="primary"
            className="w-full mt-4 flex items-center justify-center gap-2 py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {mode === 'login'
                    ? 'Sign In to Vendoora'
                    : role === 'VENDOR'
                    ? 'Register as Vendor'
                    : 'Create Customer Account'}
                </span>
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-block ml-1"
              >
                Sign up now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-block ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
