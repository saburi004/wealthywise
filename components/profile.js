"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, CreditCard, Calendar, Banknote, Edit, FileText } from 'lucide-react';
import { getUserIdFromToken } from '@/lib/tokenUtils';

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    phoneNumber: '',
    panCardNumber: '',
    dateOfBirth: '',
    bankName: '',
    fullName: '',
    firstName: ''
  });
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [authError, setAuthError] = useState('');
  const [userId, setUserId] = useState(null);
  const [canProcessPDFs, setCanProcessPDFs] = useState(false);
  const [pdfProcessingResult, setPdfProcessingResult] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1] || localStorage.getItem('wealthywise_token');

        if (!token) {
          router.push('/');
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          throw new Error('Invalid token format');
        }
        setUserId(userId);

        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.status === 401) {
          localStorage.removeItem('wealthywise_token');
          document.cookie = 'accessToken=; Max-Age=0; path=/';
          setAuthError('Session expired. Please login again.');
          router.push('/');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        const newUserData = {
          phoneNumber: data.user?.phoneNumber || '',
          panCardNumber: data.user?.panCardNumber || '',
          dateOfBirth: data.user?.dateOfBirth || '',
          bankName: data.user?.bankName || '',
          fullName: data.user?.fullName || '',
          firstName: data.user?.firstName || ''
        };
        setUserData(newUserData);
        setIsDataLoaded(true);

        // Check if profile is complete for PDF processing
        const requiredFields = ['phoneNumber', 'panCardNumber', 'dateOfBirth', 'bankName', 'fullName'];
        setCanProcessPDFs(requiredFields.every(field => newUserData[field]));
      } catch (error) {
        console.error('Profile fetch failed:', error);
        setAuthError(error.message);
      }
    };

    fetchUserData();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === 'panCardNumber' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('wealthywise_token') || 
                   document.cookie
                     .split('; ')
                     .find(row => row.startsWith('accessToken='))
                     ?.split('=')[1];
      
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setEditMode(false);
        
        const newUserData = {
          phoneNumber: data.user.phoneNumber || '',
          panCardNumber: data.user.panCardNumber || '',
          dateOfBirth: data.user.dateOfBirth || '',
          bankName: data.user.bankName || '',
          fullName: data.user.fullName || '',
          firstName: data.user.firstName || ''
        };
        setUserData(newUserData);

        // Re-check if profile is complete for PDF processing
        const requiredFields = ['phoneNumber', 'panCardNumber', 'dateOfBirth', 'bankName', 'fullName'];
        setCanProcessPDFs(requiredFields.every(field => newUserData[field]));
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPDFs = async () => {
    if (!canProcessPDFs) {
      setMessage('Please complete your profile before processing PDFs');
      return;
    }

    setPdfLoading(true);
    setMessage('');
    setPdfProcessingResult(null);

    try {
      const token = localStorage.getItem('wealthywise_token') || 
                   document.cookie
                     .split('; ')
                     .find(row => row.startsWith('accessToken='))
                     ?.split('=')[1];
      
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/process-pdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userProfile: userData })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('PDFs processed successfully!');
        setPdfProcessingResult(result);
      } else {
        setMessage(result.error || 'Failed to process PDFs');
      }
    } catch (error) {
      setMessage(error.message || 'Network error. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      localStorage.removeItem('wealthywise_token');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('wealthywise_token');
      router.push('/');
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-bold">Authentication Error</h3>
          <p>{authError}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-2 text-blue-600 hover:underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1E3A8A]">Your Profile</h2>
        <div className="flex space-x-4">
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center text-[#4ED7F1] hover:text-[#1E3A8A] transition-colors"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      {editMode ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-[#A8F1FF] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form fields (same as before) */}
            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                  placeholder="John"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type="text"
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                PAN Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type="text"
                  name="panCardNumber"
                  value={userData.panCardNumber}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={userData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                Bank Name
              </label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4ED7F1]" />
                <input
                  type="text"
                  name="bankName"
                  value={userData.bankName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/70 border border-[#A8F1FF] focus:border-[#4ED7F1] focus:ring-2 focus:ring-[#A8F1FF] outline-none transition-all duration-200 text-[#1E3A8A] placeholder-[#4ED7F1]/70"
                  placeholder="State Bank of India"
                />
              </div>
            </div>

          </div>

          {message && (
            <div className={`mt-6 p-3 rounded-lg text-sm ${
              message.includes('successful') 
                ? 'bg-[#A8F1FF] text-[#1E3A8A] border border-[#4ED7F1]' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#1E3A8A] to-[#4ED7F1] text-white py-3 px-8 rounded-lg font-semibold hover:from-[#4ED7F1] hover:to-[#1E3A8A] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">Saving...</span>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </span>
              ) : (
                'Save Profile'
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="text-[#1E3A8A] hover:text-[#4ED7F1] transition-colors py-3 px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-[#A8F1FF] p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-[#4ED7F1]">First Name</h3>
                <p className="mt-1 text-lg text-[#1E3A8A]">{userData.firstName || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#4ED7F1]">Full Name</h3>
                <p className="mt-1 text-lg text-[#1E3A8A]">{userData.fullName || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#4ED7F1]">Phone Number</h3>
                <p className="mt-1 text-lg text-[#1E3A8A]">{userData.phoneNumber || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#4ED7F1]">PAN Card Number</h3>
                <p className="mt-1 text-lg text-[#1E3A8A]">{userData.panCardNumber || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#4ED7F1]">Date of Birth</h3>
                <p className="mt-1 text-lg text-[#1E3A8A]">{formatDate(userData.dateOfBirth)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#4ED7F1]">Bank Name</h3>
                <p className="mt-1 text-lg text-[#1E3A8A]">{userData.bankName || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}