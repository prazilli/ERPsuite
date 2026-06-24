'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface Role {
  role_id: number;
  role_name: string;
}

interface RoleDropdownProps {
  selectedRoleId: number | string;
  onChange: (roleId: number) => void;
  className?: string;
}

export const RoleDropdown: React.FC<RoleDropdownProps> = ({
  selectedRoleId,
  onChange,
  className = '',
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/roles');
        if (!res.ok) {
          throw new Error('Failed to load roles from server');
        }
        const data = await res.json();
        setRoles(data);
      } catch (err: any) {
        setError(err.message || 'Error loading roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <select
          disabled
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-500 focus:outline-none transition-all text-sm"
        >
          <option>Loading roles...</option>
        </select>
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <select
          disabled
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-red-500/50 text-red-400 focus:outline-none transition-all text-sm"
        >
          <option>Error: {error}</option>
        </select>
        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <select
        required
        value={selectedRoleId}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm cursor-pointer ${className}`}
      >
        <option value="" disabled className="bg-slate-950 text-slate-500">
          Select Role
        </option>
        {roles.map((role) => (
          <option
            key={role.role_id}
            value={role.role_id}
            className="bg-slate-950 text-white"
          >
            {role.role_name}
          </option>
        ))}
      </select>
    </div>
  );
};
export default RoleDropdown;
