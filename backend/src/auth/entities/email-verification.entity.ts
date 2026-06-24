export class EmailVerificationEntity {
  verification_id: number;
  user_id: number;
  email: string;
  otp_code: string;
  expires_at: Date;
  attempts: number;
  verified: boolean;
  created_at: Date;
}
