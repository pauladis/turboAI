'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !username || !password || !password2) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== password2) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, username, password, password2);
      router.push('/auth/login');
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      const errorData = err.response?.data;
      
      // DRF returns field errors as objects with arrays
      // e.g., {"username": ["error message"]}
      if (errorData && typeof errorData === 'object') {
        // Get the first error from any field
        for (const key in errorData) {
          const fieldError = errorData[key];
          if (Array.isArray(fieldError) && fieldError.length > 0) {
            errorMessage = fieldError[0];
            break;
          } else if (typeof fieldError === 'string') {
            errorMessage = fieldError;
            break;
          }
        }
      }
      
      console.error('Signup error:', errorMessage, 'Full error data:', errorData);
      setLocalError(errorMessage);
      // Keep error visible until user tries again
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          {/* Sleeping character illustration */}
          <div className="text-5xl mb-4">😴</div>
          <h1 className="text-4xl font-serif text-amber-800">Yay, New Friend!</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-full focus:outline-none focus:border-amber-400 placeholder-gray-600 transition"
              placeholder="Email address"
              disabled={loading}
            />
          </div>

          <div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-full focus:outline-none focus:border-amber-400 placeholder-gray-600 transition"
              placeholder="Username"
              disabled={loading}
            />
          </div>

          <div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-full focus:outline-none focus:border-amber-400 placeholder-gray-600 transition"
                placeholder="Password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-amber-700 hover:text-amber-900 text-lg"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <input
              id="password2"
              type={showPassword ? 'text' : 'password'}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-full focus:outline-none focus:border-amber-400 placeholder-gray-600 transition"
              placeholder="Confirm password"
              disabled={loading}
            />
          </div>

          {(error || localError) && (
            <div className="p-4 bg-red-100 border-2 border-red-500 text-red-800 rounded-lg text-sm font-medium animate-pulse break-words">
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <span className="flex-1 break-words">{error || localError}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-transparent border-2 border-amber-700 hover:bg-amber-50 disabled:opacity-50 text-amber-700 font-serif font-medium py-3 rounded-full transition mt-6"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-amber-700 hover:text-amber-900 underline">
            We're already friends!
          </Link>
        </div>
      </div>
    </div>
  );
}
