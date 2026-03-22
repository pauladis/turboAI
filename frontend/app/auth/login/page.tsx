'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!username || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login(username, password);
      // Only redirect if login was successful
      // The catch block will set error if login fails
      setLocalError('');
      router.push('/dashboard');
    } catch (err: any) {
      let errorMessage = 'Invalid credentials';
      const errorData = err.response?.data;
      
      console.error('Login error - Full response:', err.response);
      console.error('Login error - errorData:', errorData);
      
      // Handle different error formats
      if (errorData) {
        // Check for detail field first (used by token endpoint)
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          // DRF field errors: {"username": ["error"]}
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
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Final error message:', errorMessage);
      setLocalError(errorMessage);
      // Keep error visible until user tries again
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          {/* Cactus illustration */}
          <div className="text-5xl mb-4">🌵</div>
          <h1 className="text-4xl font-serif text-amber-800 mb-2">Yay, You're Back!</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signup" className="text-sm text-amber-700 hover:text-amber-900 underline">
            Oops! I've never been here before
          </Link>
        </div>
      </div>
    </div>
  );
}
