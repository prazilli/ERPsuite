export class UserEntity {
  user_id: number;
  company_id: number;
  department_id?: number | null;
  role_id: number;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  password_hash: string;
  phone?: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}
