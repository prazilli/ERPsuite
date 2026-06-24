declare enum RedisEnabled {
    TRUE = "true",
    FALSE = "false"
}
declare class EnvironmentVariables {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    REDIS_ENABLED: RedisEnabled;
    REDIS_HOST?: string;
    REDIS_PORT?: number;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS?: string;
    SMTP_FROM_EMAIL: string;
    SMTP_FROM_NAME: string;
}
export declare function validate(config: Record<string, any>): EnvironmentVariables;
export {};
