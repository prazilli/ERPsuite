'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Loader2,
  Users,
  PlusCircle,
  CheckCircle,
  ShieldAlert,
  Key,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  UserCheck,
  UserX,
  Building,
  User,
  ArrowRight,
} from 'lucide-react';
import {
  useUsers,
  useCreateUser,
  useRoles,
  useDepartments,
} from '@/hooks/useAdminQueries';

export default function UsersPage() {
  const { user, apiFetch } = useAuth();
  const companyId = user?.companyId ? user.companyId.toString() : '';

  // Search & Pagination state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Load queries
  const { data: usersResponse, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers(companyId);
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments(companyId);

  // Mutations
  const createUserMutation = useCreateUser(companyId);

  // Local feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal control states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // New user form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('4'); // Employee
  const [selectedDept, setSelectedDept] = useState('');

  // Edit user form states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editManagerId, setEditManagerId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Custom role states
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [permissionsList, setPermissionsList] = useState<any[]>([]);

  useEffect(() => {
    // Load permissions list once
    if (user) {
      apiFetch('/users/permissions')
        .then((data) => setPermissionsList(data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Safe type conversion for data list
  const allUsersList = Array.isArray(usersResponse) ? usersResponse : usersResponse?.data || [];

  // Frontend filtering & paging based on user search
  const filteredUsers = allUsersList.filter((u: any) => {
    const term = debouncedSearch.toLowerCase();
    if (!term) return true;
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.jobTitle?.toLowerCase().includes(term)
    );
  });

  const totalFilteredCount = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredCount / limit);
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

  // Form handlers
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const spaceIndex = newName.trim().indexOf(' ');
    const firstName = spaceIndex !== -1 ? newName.trim().substring(0, spaceIndex) : newName.trim();
    const lastName = spaceIndex !== -1 ? newName.trim().substring(spaceIndex + 1) : '';

    try {
      await createUserMutation.mutateAsync({
        firstName,
        lastName,
        email: newEmail,
        roleId: selectedRole,
        departmentId: selectedDept || undefined,
      });

      setSuccess(`Employee "${newName}" registered successfully.`);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setShowAddModal(false);
      refetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to register employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (u: any) => {
    setEditingUserId(u.id);
    setEditFirstName(u.firstName || u.name?.split(' ')[0] || '');
    setEditLastName(u.lastName || u.name?.split(' ').slice(1).join(' ') || '');
    setEditPhone(u.phone || '');
    setEditRoleId(u.role?.id || '4');
    setEditDeptId(u.department?.id || '');
    setEditJobTitle(u.jobTitle || 'Associate');
    setEditManagerId(u.manager?.id || '');
    setEditIsActive(u.isActive !== undefined ? u.isActive : u.status === 'active');
    setShowEditModal(true);
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await apiFetch(`/users/${editingUserId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone || null,
          roleId: parseInt(editRoleId, 10),
          departmentId: editDeptId ? parseInt(editDeptId, 10) : null,
          jobTitle: editJobTitle,
          managerId: editManagerId ? parseInt(editManagerId, 10) : null,
          isActive: editIsActive,
        }),
      });

      setSuccess(`Employee configurations updated successfully.`);
      setShowEditModal(false);
      refetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update employee details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActiveStatus = async (u: any) => {
    setError('');
    setSuccess('');
    const newStatus = !(u.isActive !== undefined ? u.isActive : u.status === 'active');
    try {
      await apiFetch(`/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          isActive: newStatus,
        }),
      });
      setSuccess(`Employee "${u.name}" ${newStatus ? 'activated' : 'deactivated'} successfully.`);
      refetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to change employee activation state.');
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await apiFetch('/users/roles/custom', {
        method: 'POST',
        body: JSON.stringify({
          name: roleName,
          description: roleDesc,
          permissionIds: selectedPerms,
        }),
      });

      setSuccess(`Custom Role "${roleName}" defined dynamically.`);
      setRoleName('');
      setRoleDesc('');
      setSelectedPerms([]);
      setShowRoleModal(false);
      refetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to define custom role');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (id: number) => {
    if (selectedPerms.includes(id)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== id));
    } else {
      setSelectedPerms([...selectedPerms, id]);
    }
  };

  const isCompanyAdmin = user?.role === 'Company Head / CEO' || user?.role === 'Company Admin' || user?.role === 'Super Admin';
  const isDeptHead = user?.role === 'Department Head';

  if (usersLoading || rolesLoading || deptsLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Indexing employee directory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Employee Directory</span>
          </h2>
          <p className="text-sm text-slate-400">Manage staff accounts, assign hierarchical reporting managers, and define custom roles.</p>
        </div>

        <div className="flex gap-3">
          {isCompanyAdmin && (
            <button
              onClick={() => setShowRoleModal(true)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Key className="w-4 h-4" /> Define Custom Role
            </button>
          )}

          {(isCompanyAdmin || isDeptHead) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alerts */}
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

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by employee name, email or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-panel rounded-2xl border border-white/5 glow-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-sm uppercase text-slate-500 border-b border-white/5 bg-slate-900/25">
              <tr>
                <th className="py-3.5 px-6">Name / Title</th>
                <th className="py-3.5 px-6">Email / Phone</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Reporting Manager</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                {isCompanyAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No employees found matching the search criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-all">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>{u.name}</div>
                      <div className="text-sm text-slate-500 font-normal">{u.jobTitle || 'Associate'}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <div>{u.email}</div>
                      {u.phone && <div className="text-sm text-slate-500">{u.phone}</div>}
                    </td>
                    <td className="py-4 px-6 font-medium text-cyan-400">
                      {u.department?.name || 'HQ / Corporate'}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {u.manager ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>{u.manager.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-normal">None Assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-sm text-slate-300 border border-white/5 uppercase font-medium">
                        {u.role?.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        (u.isActive !== undefined ? u.isActive : u.status === 'active')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {(u.isActive !== undefined ? u.isActive : u.status === 'active') ? 'active' : 'inactive'}
                      </span>
                    </td>
                    {isCompanyAdmin && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                            title="Edit configurations"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActiveStatus(u)}
                            className={`p-1 rounded transition-all cursor-pointer ${
                              (u.isActive !== undefined ? u.isActive : u.status === 'active')
                                ? 'text-red-400 hover:bg-red-500/10'
                                : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={(u.isActive !== undefined ? u.isActive : u.status === 'active') ? 'Deactivate' : 'Activate'}
                          >
                            {(u.isActive !== undefined ? u.isActive : u.status === 'active') ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-900/10 text-sm">
            <span className="text-slate-400">
              Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalFilteredCount} employees)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Organizational Hierarchy Explorer widget */}
      <div className="glass-panel rounded-2xl border border-white/5 glow-shadow p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-cyan-400" />
          <span>Reporting Manager Hierarchy</span>
        </h3>
        <p className="text-sm text-slate-400">Quick mapping of active reporting lines configured inside the workspace.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allUsersList.filter((u: any) => u.manager).map((u: any) => (
            <div key={`hier-${u.id}`} className="bg-slate-950/40 p-3 rounded-lg border border-white/5 text-sm flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">{u.name}</span>
                <span className="block text-sm text-slate-500">{u.jobTitle || 'Associate'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <div className="text-right">
                <span className="font-semibold text-cyan-400">{u.manager.name}</span>
                <span className="block text-sm text-slate-500">Supervisor / Manager</span>
              </div>
            </div>
          ))}
          {allUsersList.filter((u: any) => u.manager).length === 0 && (
            <div className="col-span-full py-4 text-center text-slate-600 text-sm">
              No active manager relationships mapped yet. Edit employees above to link reporting supervisors.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl glow-shadow border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Employee Account</h3>
            <p className="text-sm text-slate-400">Register a staff member. Default password is **Amdox123!** which they can reset.</p>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="staff@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Role Authority</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {roles
                      .filter((r: any) => r.id !== '1') // Do not display Super Admin
                      .map((r: any) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                  </select>
                </div>

                {!isDeptHead && (
                  <div>
                    <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Department</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Headquarters / Corporate</option>
                      {departments.map((d: any) => (
                        <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Register Staff <CheckCircle className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit User Configuration Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl glow-shadow border border-white/5 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">Edit Employee Configurations</h3>
            <p className="text-sm text-slate-400">Update workspace allocations, reporting hierarchy, and account status.</p>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 555-0199"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Role Authority</label>
                  <select
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {roles
                      .filter((r: any) => r.id !== '1')
                      .map((r: any) => (
                        <option key={`edit-role-${r.id}`} value={r.id}>{r.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Headquarters / Corporate</option>
                    {departments.map((d: any) => (
                      <option key={`edit-dept-${d.department_id}`} value={d.department_id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Developer"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Reporting Manager</label>
                  <select
                    value={editManagerId}
                    onChange={(e) => setEditManagerId(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">No Supervisor / Self</option>
                    {allUsersList
                      .filter((usr: any) => usr.id !== editingUserId)
                      .map((usr: any) => (
                        <option key={`edit-mgr-${usr.id}`} value={usr.id}>{usr.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-sm text-slate-300 font-semibold cursor-pointer">
                  Account is Active (enable credentials to log in)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Save Changes <CheckCircle className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Custom Role */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl glow-shadow border border-white/5 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">Define Dynamic Custom Role</h3>
            <p className="text-sm text-slate-400">Create a custom security authority and map specific dynamic permissions to it.</p>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Coordinator"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Has access to lead analytics lists"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Permissions Mapping</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-700 rounded p-2.5 bg-slate-900">
                  {permissionsList.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(parseInt(perm.id, 10))}
                        onChange={() => togglePermission(parseInt(perm.id, 10))}
                        className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Define Role <CheckCircle className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
