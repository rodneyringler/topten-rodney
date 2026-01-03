'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        // For demo purposes, show the reset link
        if (data.data?.resetUrl) {
          setSuccess(`Reset link generated! For demo purposes: ${data.data.resetUrl}`);
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.password !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: passwords.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If we have a token, show the password reset form
  if (token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Logo size="lg" />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Set new password</h1>
            <p className="mt-2 text-gray-600">Enter your new password below.</p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8">
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
                  {success}
                  <Link href="/auth/login" className="block mt-2 text-green-700 font-medium">
                    Go to login →
                  </Link>
                </div>
              )}

              {!success && (
                <>
                  <Input
                    label="New Password"
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    helpText="Min 8 characters with 1 uppercase, 1 number, and 1 special character"
                    value={passwords.password}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    required
                  />

                  <Button type="submit" fullWidth isLoading={isLoading}>
                    Reset Password
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show the email request form
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-gray-600">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          <form onSubmit={handleRequestReset} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm break-all">
                {success}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-primary-600 hover:text-primary-700">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
