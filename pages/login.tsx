/**
 * T061 [P] [US1] Login page
 * User authentication form
 */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../src/components/layout/Layout';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Login successful, redirect to home
      router.push('/');
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-parchment py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-heading font-extrabold text-ink">
              Welcome Back, Adventurer
            </h2>
            <p className="mt-2 text-center text-sm text-ink-light">
              Sign in to continue your journey
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="rounded-md shadow-sm space-y-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="your@email.com"
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="Your password"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-ink-light">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="font-medium text-leather hover:text-leather-dark"
                >
                  Create one
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
