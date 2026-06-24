import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export function useCompanyProfile(companyId: string) {
  const { apiFetch } = useAuth();
  return useQuery({
    queryKey: ['company', companyId],
    queryFn: () => apiFetch(`/companies/${companyId}/profile`),
    enabled: !!companyId,
  });
}

export function useUpdateCompanyProfile(companyId: string) {
  const { apiFetch } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { companyName: string }) =>
      apiFetch(`/companies/${companyId}/profile`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
    },
  });
}

export function useDepartments(companyId: string) {
  const { apiFetch } = useAuth();
  return useQuery({
    queryKey: ['departments', companyId],
    queryFn: () => apiFetch(`/departments?companyId=${companyId}`),
    enabled: !!companyId,
  });
}

export function useCreateDepartment(companyId: string) {
  const { apiFetch } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string; featuresEnabled?: string[] }) =>
      apiFetch(`/departments?companyId=${companyId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
    },
  });
}

export function useUpdateDepartment(companyId: string) {
  const { apiFetch } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, description, featuresEnabled }: { id: string; name: string; description: string; featuresEnabled?: string[] }) =>
      apiFetch(`/departments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, description, featuresEnabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
    },
  });
}

export function useDeleteDepartment(companyId: string) {
  const { apiFetch } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/departments/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
    },
  });
}

export function useAssignDepartmentHead(companyId: string) {
  const { apiFetch } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      apiFetch(`/departments/${id}/assign-head`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
      queryClient.invalidateQueries({ queryKey: ['users', companyId] });
    },
  });
}

export function useUsers(companyId: string) {
  const { apiFetch } = useAuth();
  return useQuery({
    queryKey: ['users', companyId],
    queryFn: () => apiFetch(`/users?companyId=${companyId}`),
    enabled: !!companyId,
  });
}

export function useCreateUser(companyId: string) {
  const { apiFetch } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string; phone?: string; roleId: string; departmentId?: string }) =>
      apiFetch(`/users?companyId=${companyId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', companyId] });
    },
  });
}

export function useRoles() {
  const { apiFetch } = useAuth();
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => apiFetch(`/users/roles`),
  });
}
