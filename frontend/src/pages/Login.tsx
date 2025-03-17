import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Add login logic here
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 text-white flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <Brain className="w-20 h-20 mx-auto mb-8" />
          <h1 className="text-4xl font-bold mb-6">Welcome to NeuroNote</h1>
          <p className="text-lg opacity-90">
            Transform your learning experience with AI-powered flashcards. Upload your study materials
            and let NeuroNote generate intelligent questions to enhance your understanding.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Brain className="w-12 h-12 text-indigo-400 mx-auto lg:hidden" />
            <h2 className="mt-6 text-3xl font-bold text-white">Sign in to NeuroNote</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email or Phone Number
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              Sign in
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">
            New to NeuroNote?{' '}
            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}