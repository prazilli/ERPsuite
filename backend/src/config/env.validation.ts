import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum RedisEnabled {
  TRUE = 'true',
  FALSE = 'false',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsNotEmpty()
  @IsEnum(RedisEnabled)
  REDIS_ENABLED: RedisEnabled;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsNumber()
  REDIS_PORT?: number;

  @IsNotEmpty()
  @IsString()
  SMTP_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  SMTP_PORT: number;

  @IsNotEmpty()
  @IsString()
  SMTP_USER: string;

  @IsOptional()
  @IsString()
  SMTP_PASS?: string;

  @IsNotEmpty()
  @IsString()
  SMTP_FROM_EMAIL: string;

  @IsNotEmpty()
  @IsString()
  SMTP_FROM_NAME: string;
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true }
  );
  
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }
  
  const checkForbiddenPatterns = (key: string, value: any) => {
    if (value === undefined || value === null) return;
    const str = String(value);
    
    // Check for markdown links: e.g. [text](link) or [text]
    if (str.includes('[') || str.includes(']') || str.includes('(') || str.includes(')')) {
      throw new Error(`Environment validation failed: ${key} cannot contain markdown links/brackets. Value received: "${str}"`);
    }
    
    // Check for mailto: prefix
    if (str.toLowerCase().includes('mailto:')) {
      throw new Error(`Environment validation failed: ${key} cannot contain mailto values. Value received: "${str}"`);
    }
    
    // Check for wrapped strings: e.g. <email@example.com>
    if (str.includes('<') || str.includes('>')) {
      throw new Error(`Environment validation failed: ${key} cannot contain wrapped email/bracket symbols. Value received: "${str}"`);
    }
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validateEmailFormat = (key: string, value: any) => {
    checkForbiddenPatterns(key, value);
    if (value === undefined || value === null) return;
    const str = String(value);
    if (!emailRegex.test(str)) {
      throw new Error(`Environment validation failed: ${key} has a malformed email format. Value received: "${str}"`);
    }
  };

  // Validate SMTP Environment Variables
  validateEmailFormat('SMTP_USER', validatedConfig.SMTP_USER);
  validateEmailFormat('SMTP_FROM_EMAIL', validatedConfig.SMTP_FROM_EMAIL);
  
  checkForbiddenPatterns('SMTP_HOST', validatedConfig.SMTP_HOST);
  checkForbiddenPatterns('SMTP_FROM_NAME', validatedConfig.SMTP_FROM_NAME);
  if (validatedConfig.SMTP_PASS) {
    checkForbiddenPatterns('SMTP_PASS', validatedConfig.SMTP_PASS);
  }

  // Custom conditional check: if Redis is enabled, require host and port
  if (validatedConfig.REDIS_ENABLED === RedisEnabled.TRUE) {
    if (!validatedConfig.REDIS_HOST || validatedConfig.REDIS_HOST.trim() === '') {
      throw new Error('Environment validation failed: REDIS_HOST must be provided when REDIS_ENABLED=true');
    }
    if (!validatedConfig.REDIS_PORT) {
      throw new Error('Environment validation failed: REDIS_PORT must be provided when REDIS_ENABLED=true');
    }
  }

  return validatedConfig;
}
