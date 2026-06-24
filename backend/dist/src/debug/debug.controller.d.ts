import { MailService } from '../mail/mail.service';
declare class TestEmailDto {
    email: string;
}
export declare class DebugController {
    private readonly mailService;
    private readonly logger;
    constructor(mailService: MailService);
    testEmail(dto: TestEmailDto): Promise<{
        success: boolean;
        message: string;
        details: {
            recipient: string;
            otp: string;
            host: string | undefined;
            port: number;
            user: string | undefined;
        };
        error?: undefined;
        stack?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        stack: any;
        details: {
            recipient: string;
            host: string | undefined;
            port: number;
            user: string | undefined;
            otp?: undefined;
        };
    }>;
}
export {};
