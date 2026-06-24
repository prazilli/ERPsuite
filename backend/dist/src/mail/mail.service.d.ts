import { OnModuleInit } from '@nestjs/common';
export declare class MailService implements OnModuleInit {
    private readonly logger;
    private transporter;
    constructor();
    onModuleInit(): Promise<void>;
    sendOtpEmail(recipientEmail: string, otpCode: string, firstName: string): Promise<void>;
}
