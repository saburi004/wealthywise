"use client";
import React from 'react';
import { Home, LineChart, HelpCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function WealthyWiseNavbar() {
  return (
    <nav className="bg-white border-b border-[#A8F1FF] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gradient-to-r from-[#4ED7F1] to-[#1E3A8A] p-2 rounded-lg mr-2">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#4ED7F1] bg-clip-text text-transparent">
                WealthyWise
              </span>
            </div>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link href="/" className="flex items-center text-[#1E3A8A] hover:text-[#4ED7F1] transition-colors">
                <Home className="h-5 w-5 mr-2" />
                <span>Home</span>
              </Link>
              <Link href="/analytics" className="flex items-center text-[#1E3A8A] hover:text-[#4ED7F1] transition-colors">
                <LineChart className="h-5 w-5 mr-2" />
                <span>Analytics</span>
              </Link>
              <Link href="/help" className="flex items-center text-[#1E3A8A] hover:text-[#4ED7F1] transition-colors">
                <HelpCircle className="h-5 w-5 mr-2" />
                <span>Help</span>
              </Link>
            </div>
          </div>

          {/* Right side - User Profile (placeholder) */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-[#1E3A8A] hover:text-[#4ED7F1] focus:outline-none">
                <span className="sr-only">View profile</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#A8F1FF] to-[#4ED7F1] flex items-center justify-center text-white font-medium">
                  U
                </div>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-[#1E3A8A] hover:text-[#4ED7F1] hover:bg-[#A8F1FF] focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="flex items-center text-[#1E3A8A] hover:text-[#4ED7F1] block px-3 py-2 rounded-md text-base font-medium">
            <Home className="h-5 w-5 mr-2" />
            <span>Home</span>
          </Link>
          <Link href="/analytics" className="flex items-center text-[#1E3A8A] hover:text-[#4ED7F1] block px-3 py-2 rounded-md text-base font-medium">
            <LineChart className="h-5 w-5 mr-2" />
            <span>Analytics</span>
          </Link>
          <Link href="/help" className="flex items-center text-[#1E3A8A] hover:text-[#4ED7F1] block px-3 py-2 rounded-md text-base font-medium">
            <HelpCircle className="h-5 w-5 mr-2" />
            <span>Help</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}