"use client";
import { auth, provider, signInWithPopup } from '../lib/firebase'; // already provided

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, ArrowRight, Eye, EyeOff, Mail, Lock, Coins, Landmark, PiggyBank, Wallet } from 'lucide-react';

export default function WealthyWiseAuth() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  try {
    const endpoint = '/api/auth';
    console.log('Making request to:', endpoint); // Debug
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        action: activeTab 
      })
    });

    const data = await response.json();
    console.log('Response data:', data); // Debug response

    if (response.ok) {
      if (activeTab === 'login' && data.token) {
        console.log('Token received:', data.token); // Debug token
        setToken(data.token);
        localStorage.setItem('wealthywise_token', data.token);
        setMessage('Login successful! Redirecting...');
        
        // Verify token is stored
        console.log('Token in localStorage:', localStorage.getItem('wealthywise_token'));
      } else if (activeTab === 'register') {
        setMessage('Registration successful! Please login.');
        setActiveTab('login');
      }
    } else {
      setMessage(data.message || 'An error occurred');
    }
  } catch (error) {
    console.error('Login error:', error); // Debug error
    setMessage('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
const handleGoogleLogin = async () => {
  setLoading(true);
  setMessage('');
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        googleId: user.uid,
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem('wealthywise_token', data.token);
      setToken(data.token);
      setMessage('Login successful! Redirecting...');
    } else {
      setMessage(data.message || 'Google login failed');
    }

  } catch (error) {
    console.error('Google login error:', error);
    setMessage('Google login failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8F1FF] to-white relative overflow-hidden flex items-center justify-center">
      {/* Water Bubble Background Elements */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-[#4ED7F1]"
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.3,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Financial Icons */}
      <div className="absolute top-20 left-20 text-[#4ED7F1] opacity-30 animate-bounce">
        <Coins className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 right-20 text-[#4ED7F1] opacity-30 animate-pulse">
        <PiggyBank className="w-10 h-10" />
      </div>
      <div className="absolute top-1/3 right-10 text-[#4ED7F1] opacity-30 animate-bounce delay-1000">
        <Landmark className="w-12 h-12" />
      </div>
      <div className="absolute bottom-1/4 left-10 text-[#4ED7F1] opacity-30 animate-pulse delay-500">
        <Wallet className="w-10 h-10" />
      </div>

      {/* Main Form Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-[#A8F1FF] p-8">
          
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-[#4ED7F1] to-[#1E3A8A] p-3 rounded-xl shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#4ED7F1] bg-clip-text text-transparent">
                WealthyWise
              </h1>
            </div>
            <p className="text-slate-600">Smart money management starts here</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-[#A8F1FF] rounded-lg p-1 mb-8">
            <button
              onClick={() => {
                setActiveTab('login');
                setMessage('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#1E3A8A] to-[#4ED7F1] text-white shadow-lg'
                  : 'text-[#1E3A8A] hover:text-[#4ED7F1]'
              }`}
            >
              Login
            </button>
             

            <button
              onClick={() => {
                setActiveTab('register');
                setMessage('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#4ED7F1] to-[#1E3A8A] text-white shadow-lg'
                  : 'text-[#1E3A8A] hover:text-[#4ED7F1]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4ED7F1] hover:text-[#1E3A8A]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successful') 
                  ? 'bg-[#A8F1FF] text-[#1E3A8A] border border-[#4ED7F1]' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

          {/* Google Login Button */}


            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#4ED7F1] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#4ED7F1] hover:to-[#1E3A8A] transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              

              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            {/* Google Login Button */}
<button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full mt-4 bg-white border border-[#4ED7F1] text-[#1E3A8A] py-3 px-6 rounded-lg font-semibold hover:bg-[#E0F7FF] transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3 shadow-md"
>
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="Google logo"
    className="w-5 h-5"
  />
  <span>Continue with Google</span>
</button>

            
          </div>

        </div>
      </div>
    </div>
  );
}