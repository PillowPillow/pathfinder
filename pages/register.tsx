/**
 * T060 [P] [US1] Registration page
 * User registration form with email, password, and display name
 */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../src/components/layout/Layout';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Registration successful, redirect to home
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
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-sm text-ink-light">
              Join the adventure and start managing your party
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
                label="Display Name"
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                required
                placeholder="e.g., Gandalf"
                minLength={2}
                maxLength={50}
              />
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
                placeholder="At least 8 characters"
                minLength={8}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-ink-light">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-medium text-leather hover:text-leather-dark"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
