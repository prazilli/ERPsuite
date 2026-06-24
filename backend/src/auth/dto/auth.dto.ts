import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn, IsBoolean } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsOptional()
  departmentName?: string;

  @IsBoolean()
  @IsOptional()
  isNewDepartmentRequest?: boolean;

  @IsNotEmpty()
  roleId: string | number;
}

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['registration', 'password_reset'])
  purpose: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  otp: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['registration', 'password_reset'])
  purpose: string;
}

export class ResetPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordConfirmDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class TestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

