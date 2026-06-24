'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Calendar,
  Clock,
  Heart,
  PlusCircle,
  CheckCircle,
  Loader2,
  FileCheck2,
  User,
  MapPin,
  TrendingUp,
  DollarSign,
  Plus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export default function HrmsPage() {
  const { user, apiFetch } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [checkInStatus, setCheckInStatus] = useState<string>('');
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Profile Edit modal
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editManagerId, setEditManagerId] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editBaseSalary, setEditBaseSalary] = useState('');
  const [editAllowances, setEditAllowances] = useState('');
  const [editDeductions, setEditDeductions] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const isManagement = user?.role === 'Company Head / CEO' || user?.role === 'Department Head' || user?.role === 'Company Admin';
  const isCeo = user?.role === 'Company Head / CEO';

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      
      // Fetch personal profile (contains leave balances, manager info)
      const uProfile = await apiFetch(`/hrms/employees/${user.id}/profile`);
      setProfile(uProfile);

      // Fetch personal attendance logs
      const att = await apiFetch(`/hrms/employees/${user.id}/attendance`);
      setAttendance(att);

      // Fetch personal leaves
      const lvs = await apiFetch(`/hrms/employees/${user.id}/leaves`);
      setLeaves(lvs);

      // Fetch personal payroll history
      const pay = await apiFetch(`/hrms/employees/${user.id}/payroll`);
      setPayroll(pay);

      // Fetch holidays list
      const hols = await apiFetch('/hrms/holidays');
      setHolidays(hols);

      // Check if already checked in today
      const todayStr = new Date().toDateString();
      const todayCheckIn = att.find((a: any) => new Date(a.check_in).toDateString() === todayStr);
      if (todayCheckIn) {
        setCheckInStatus(todayCheckIn.check_out ? 'Checked Out' : 'Checked In');
      } else {
        setCheckInStatus('Not Checked In');
      }

      // If manager/admin, load directories and team leaves
      if (isManagement) {
        const emps = await apiFetch('/hrms/employees');
        setEmployees(emps);

        const tLeaves = await apiFetch('/hrms/leaves/team');
        setTeamLeaves(tLeaves);
      }

    } catch (e: any) {
      setError(e.message || 'Failed to fetch HRMS records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setError(''); setSuccess('');
    try {
      await apiFetch(`/hrms/employees/${user.id}/check-in`, { method: 'POST' });
      setSuccess('Check-in logged successfully.');
      setCheckInStatus('Checked In');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Check-in failed.');
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setError(''); setSuccess('');
    try {
      await apiFetch(`/hrms/employees/${user.id}/check-out`, { method: 'POST' });
      setSuccess('Check-out logged successfully.');
      setCheckInStatus('Checked Out');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Check-out failed.');
    }
  };

  const handleLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(''); setSuccess(''); setSubmittingLeave(true);
    try {
      await apiFetch(`/hrms/employees/${user.id}/leaves`, {
        method: 'POST',
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          reason
        })
      });
      setSuccess('Leave request submitted to workflow engine.');
      setStartDate('');
      setEndDate('');
      setReason('');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Leave submission failed.');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setEditFirstName(emp.first_name || '');
    setEditLastName(emp.last_name || '');
    setEditPhone(emp.phone || '');
    setEditJobTitle(emp.employee_profile?.job_title || 'Associate');
    setEditManagerId(emp.employee_profile?.manager_id?.toString() || '');
    setEditStatus(emp.employee_profile?.status || 'ACTIVE');
    setEditBaseSalary(emp.salary_structure?.base_salary?.toString() || '0');
    setEditAllowances(emp.salary_structure?.allowances?.toString() || '0');
    setEditDeductions(emp.salary_structure?.deductions?.toString() || '0');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setError(''); setSuccess(''); setUpdatingProfile(true);
    try {
      await apiFetch(`/hrms/employees/${editingEmployee.user_id}/profile`, {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
          jobTitle: editJobTitle,
          managerId: editManagerId ? parseInt(editManagerId, 10) : null,
          status: editStatus,
          baseSalary: editBaseSalary ? parseFloat(editBaseSalary) : 0,
          allowances: editAllowances ? parseFloat(editAllowances) : 0,
          deductions: editDeductions ? parseFloat(editDeductions) : 0,
        })
      });
      setSuccess(`Profile of ${editFirstName} updated successfully.`);
      setEditingEmployee(null);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Profile update failed.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Syncing HRMS records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" /> HR & Directory Workspace
          </h2>
          <p className="text-sm text-text-muted">Staff files, check-in, leaves registry, and pay details</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-lg border border-border-color bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
          {success}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2-Span): Personal registers or Management directories */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Check-In/Out widget */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6 glow-shadow">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Daily Attendance Logging
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/30 border border-white/5">
              <div>
                <span className="text-sm uppercase text-text-muted block">Status Register</span>
                <span className="text-sm font-bold text-white">{checkInStatus}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={checkInStatus !== 'Not Checked In'}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg transition-all cursor-pointer"
                >
                  Check In
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={checkInStatus !== 'Checked In'}
                  className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg transition-all cursor-pointer"
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>

          {/* Leave request form */}
          {!isCeo && (
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" /> File Leave Request
            </h3>
            <form onSubmit={handleLeaveRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm uppercase text-text-muted font-bold mb-1.5">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm uppercase text-text-muted font-bold mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase text-text-muted font-bold mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm uppercase text-text-muted font-bold mb-1.5">Reason Details</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Justification details for department approval..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingLeave}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-lg flex items-center gap-1 cursor-pointer transition-all"
              >
                {submittingLeave ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Submit to Workflow</>}
              </button>
            </form>
          </div>
          )}

          {/* Leave Request History */}
          {!isCeo && (
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">My Leave History</h3>
              </div>
              <div className="p-5 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {leaves.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No leave requests found.</p>
                ) : (
                  leaves.map((lv: any) => (
                    <div key={lv.leave_id} className="p-4 bg-slate-900/40 rounded-xl border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{lv.leave_type} Leave</span>
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                            lv.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                            lv.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {lv.status}
                          </span>
                        </div>
                        <span className="text-sm text-text-muted">
                          {new Date(lv.start_date).toLocaleDateString()} &rarr; {new Date(lv.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        <span className="font-semibold text-slate-300">Reason:</span> {lv.reason}
                      </div>
                      {lv.status === 'REJECTED' && (
                        <div className="mt-1 text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                          <span className="font-bold">Reason:</span> {lv.manager_comments || 'No comment provided'}
                        </div>
                      )}
                      {lv.status === 'APPROVED' && lv.manager_comments && (
                        <div className="mt-1 text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                          <span className="font-bold">Manager Comments:</span> {lv.manager_comments}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Directory of company employees (visible to admins/managers) */}
          {isManagement && (
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" /> Employee Directory Control
                </h3>
                <span className="text-sm bg-slate-800 text-slate-300 border border-white/5 px-2.5 py-0.5 rounded-full">
                  {employees.length} Members
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                    <tr>
                      <th className="py-3.5 px-6">Name</th>
                      <th className="py-3.5 px-6">Job Title</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Role Permissions</th>
                      {isCeo && <th className="py-3.5 px-6">Base Salary</th>}
                      <th className="py-3.5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map((emp) => (
                      <tr key={emp.user_id} className="hover:bg-slate-900/40 transition-all">
                        <td className="py-3.5 px-6 font-semibold text-white">
                          {emp.first_name} {emp.last_name}
                          <span className="block text-sm text-text-muted font-normal">{emp.email}</span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-300">{emp.employee_profile?.job_title || 'Associate'}</td>
                        <td className="py-3.5 px-6 text-slate-300">{emp.department?.department_name || 'Unassigned'}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-sm text-slate-300 font-semibold border border-white/5 uppercase">
                            {emp.role?.role_name || 'Employee'}
                          </span>
                        </td>
                        {isCeo && (
                          <td className="py-3.5 px-6 font-semibold text-emerald-400">
                            ${emp.salary_structure?.base_salary?.toLocaleString() || '0'}
                          </td>
                        )}
                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-white/5 cursor-pointer"
                          >
                            Edit File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (1-Span): Personal data summaries & side items */}
        <div className="space-y-6">
          
          {/* Leave balance counters */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-cyan-400" /> Leave Balances
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(profile?.leave_balances || []).map((lb: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-center">
                  <span className="text-sm text-text-muted block font-bold uppercase">{lb.leave_type}</span>
                  <h4 className="text-lg font-black text-white mt-1">{lb.allotted - lb.used} / {lb.allotted}</h4>
                  <span className="text-xs text-text-muted mt-0.5 block">Days Remaining</span>
                </div>
              ))}
              {(!profile?.leave_balances || profile.leave_balances.length === 0) && (
                <div className="col-span-2 text-center text-sm text-text-muted py-2">No leave allocations loaded.</div>
              )}
            </div>
          </div>

          {/* Personal pay slips list */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-cyan-400" /> My Pay Slips
            </h3>
            <div className="space-y-3">
              {payroll.map((slip) => (
                <div key={slip.payroll_id} className="p-3.5 rounded-xl bg-slate-950/30 border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-white block">{slip.month}</span>
                    <span className="text-xs text-text-muted block">Direct Deposit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">${slip.net_salary?.toLocaleString()}</span>
                    <span className="text-xs text-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-bold uppercase block mt-1">
                      {slip.status}
                    </span>
                  </div>
                </div>
              ))}
              {payroll.length === 0 && (
                <div className="text-center text-sm text-text-muted py-2">No pay records found.</div>
              )}
            </div>
          </div>

          {/* Holiday schedule list */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" /> Corporate Holidays
            </h3>
            <div className="space-y-3">
              {holidays.map((h) => (
                <div key={h.holiday_id} className="flex justify-between items-start text-sm p-2.5 rounded-lg bg-slate-950/20 border border-white/5">
                  <div>
                    <span className="text-white block font-semibold">{h.name}</span>
                    <span className="text-sm text-text-muted">{new Date(h.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-400 border border-white/5 px-2 py-0.5 rounded font-bold uppercase">
                    Holiday
                  </span>
                </div>
              ))}
              {holidays.length === 0 && (
                <div className="text-center text-sm text-text-muted py-2">No holidays recorded.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Profile Edit Modal (visible to CEO or self on edit) */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" /> Edit Staff Records: {editingEmployee.first_name}
              </h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">First Name</label>
                    <input
                      type="text" required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text" required
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Job Title</label>
                    <input
                      type="text" required
                      value={editJobTitle}
                      onChange={(e) => setEditJobTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Reporting Manager ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      value={editManagerId}
                      onChange={(e) => setEditManagerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Employee Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>

                {isCeo && (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-3">
                    <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Compensation Structure (CEO Action Only)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-text-muted mb-0.5">Base Salary ($)</label>
                        <input
                          type="number"
                          value={editBaseSalary}
                          onChange={(e) => setEditBaseSalary(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-0.5">Allowances ($)</label>
                        <input
                          type="number"
                          value={editAllowances}
                          onChange={(e) => setEditAllowances(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-0.5">Deductions ($)</label>
                        <input
                          type="number"
                          value={editDeductions}
                          onChange={(e) => setEditDeductions(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {updatingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Parameters'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
