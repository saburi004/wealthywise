"use client";
import { useState } from 'react';
import Link from 'next/link';
import { User, LineChart, CreditCard, PieChart } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [activeTab, setActiveTab] = useState('profile');

  const navItems = [
    { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
    { id: 'statistics', icon: <LineChart className="w-5 h-5" />, label: 'Statistics' },
    { id: 'transactions', icon: <CreditCard className="w-5 h-5" />, label: 'Transactions' },
    { id: 'investments', icon: <PieChart className="w-5 h-5" />, label: 'Investments' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8F1FF] to-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-[#A8F1FF]">
        {/* Logo */}
        <div className="flex items-center p-6 border-b border-[#A8F1FF]">
          {/* <div className="bg-gradient-to-r from-[#4ED7F1] to-[#1E3A8A] p-2 rounded-lg mr-3">
            <DollarSign className="w-6 h-6 text-white" />
          </div> */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#4ED7F1] bg-clip-text text-transparent">
            WealthyWise
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dashboard/${item.id}`}
                  className={`flex items-center p-3 rounded-lg transition-all ${activeTab === item.id 
                    ? 'bg-gradient-to-r from-[#1E3A8A] to-[#4ED7F1] text-white shadow-md' 
                    : 'text-[#1E3A8A] hover:bg-[#A8F1FF] hover:text-[#1E3A8A]'}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}