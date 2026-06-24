'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ShieldAlert,
  Loader2,
  Network,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface Company {
  company_id: string | number;
  company_name: string;
}

interface Department {
  department_id: string | number;
  department_name: string;
}

export default function JoinCompanyPage() {
  const { register } = useAuth();
  const router = useRouter();

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Organization selector states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | number>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [customDepartmentName, setCustomDepartmentName] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');

  const isCustomDepartment = selectedDepartmentName === 'CUSTOM_REQUEST';

  // Loading/Fetch states
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form notifications states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Fetch all companies on page load
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('http://localhost:5000/auth/companies');
        if (!res.ok) throw new Error('Failed to load registered companies');
        const data = await res.json();
        setCompanies(data);
      } catch (err: any) {
        setError(err.message || 'Could not load companies. Please check if the server is running.');
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // 2. Fetch departments dynamically when company is selected
  useEffect(() => {
    if (!selectedCompanyId) {
      setDepartments([]);
      setSelectedDepartmentName('');
      return;
    }

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      setSelectedDepartmentName('');
      try {
        const res = await fetch(`http://localhost:5000/auth/companies/${selectedCompanyId}/departments`);
        if (!res.ok) throw new Error('Failed to fetch company departments');
        const data = await res.json();
        setDepartments(data);
      } catch (err: any) {
        setError(err.message || 'Could not load departments for the selected company.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    // Find the company name corresponding to selected ID
    const comp = companies.find(c => c.company_id.toString() === selectedCompanyId.toString());
    if (comp) {
      setSelectedCompanyName(comp.company_name);
    }

    fetchDepartments();
  }, [selectedCompanyId, companies]);

  // 3. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and Last name are required.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!selectedCompanyName) {
      setError('Please select a company.');
      return;
    }
    const isCustom = selectedDepartmentName === 'CUSTOM_REQUEST';
    const deptName = isCustom ? customDepartmentName.trim() : selectedDepartmentName;

    if (!selectedDepartmentName) {
      setError('Please select your department.');
      return;
    }
    if (isCustom && !customDepartmentName.trim()) {
      setError('Please enter the custom department name.');
      return;
    }
    if (!roleId) {
      setError('Please select a role.');
      return;
    }

    setFormSubmitting(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        companyName: selectedCompanyName,
        departmentName: deptName,
        isNewDepartmentRequest: isCustom ? true : undefined,
        roleId: Number(roleId),
      });

      setSuccess('Registration successful! Redirecting to email verification...');
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#0b0f19] to-black p-4 relative overflow-hidden">
      {/* Technical Grid Overlay */}
      <div className="tech-grid"></div>

      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-2xl glass-panel rounded-2xl glow-shadow border border-white/5 p-8 relative z-10 my-8 animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-extrabold uppercase tracking-widest mb-4">
            <Building2 className="w-3.5 h-3.5" />
            Workspace Integration
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Join Your Organization
          </h1>
          <p className="text-sm font-semibold tracking-wider text-cyan-400/80 uppercase mt-1.5">
            Associate your profile with an existing enterprise workspace
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium flex gap-3 items-center">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-medium flex gap-3 items-center">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Organization Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-2">
              Organization Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Company Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Select Company *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    required
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    disabled={loadingCompanies}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-500">
                      {loadingCompanies ? 'Loading companies...' : 'Select Company'}
                    </option>
                    {companies.map((company) => (
                      <option
                        key={company.company_id}
                        value={company.company_id}
                        className="bg-slate-950 text-white"
                      >
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Dropdown (Restricted to Department Head & Employee) */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Role Dropdown *</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    required
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-500">
                      Select Role
                    </option>
                    <option value={2} className="bg-slate-950 text-white">Department Head</option>
                    <option value={3} className="bg-slate-950 text-white">Employee</option>
                  </select>
                </div>
              </div>

              {/* Department Dropdown (Populated Dynamically) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Select Department *</label>
                  <div className="relative">
                    <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      required
                      value={selectedDepartmentName}
                      onChange={(e) => setSelectedDepartmentName(e.target.value)}
                      disabled={!selectedCompanyId || loadingDepartments}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled className="bg-slate-950 text-slate-500">
                        {!selectedCompanyId 
                          ? 'Select Company first' 
                          : loadingDepartments 
                            ? 'Loading departments...' 
                            : 'Select Department'
                        }
                      </option>
                      {departments.map((dept) => (
                        <option
                          key={dept.department_id}
                          value={dept.department_name}
                          className="bg-slate-950 text-white"
                        >
                          {dept.department_name}
                        </option>
                      ))}
                      {selectedCompanyId && !loadingDepartments && (
                        <option value="CUSTOM_REQUEST" className="bg-slate-950 text-indigo-400 font-bold">
                          + Request New Department
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                {isCustomDepartment && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-semibold text-indigo-400 mb-1.5">Request Department Name *</label>
                    <div className="relative">
                      <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Marketing, Sales"
                        value={customDepartmentName}
                        onChange={(e) => setCustomDepartmentName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-indigo-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Security Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-2">
              Security Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={formSubmitting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Integrating Workspace...</span>
              </>
            ) : (
              <>
                <span>Join Workspace Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center text-sm text-slate-400 border-t border-white/5 pt-6">
          Already registered?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-all">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
