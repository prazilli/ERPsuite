"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    transporter = null;
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        this.logger.log(`SMTP Host: ${host}`);
        this.logger.log(`SMTP Port: ${port}`);
        this.logger.log(`SMTP User: ${user}`);
        try {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: false,
                auth: {
                    user,
                    pass: pass || '',
                },
            });
            this.logger.log('SMTP configuration loaded successfully');
        }
        catch (err) {
            this.logger.error(`Failed to initialize SMTP Mail transport: ${err.message}`, err.stack);
            throw err;
        }
    }
    async onModuleInit() {
        if (this.transporter) {
            try {
                this.logger.log('Testing SMTP connection on startup...');
                await this.transporter.verify();
                this.logger.log('SMTP Verify Success');
            }
            catch (err) {
                this.logger.error(`SMTP Verify Failure: ${err.message}`, err.stack);
                this.logger.warn('SMTP connection failed on startup. Server will continue running, but email delivery will fail.');
            }
        }
    }
    async sendOtpEmail(recipientEmail, otpCode, firstName) {
        this.logger.log(`Email Service Invoked. Recipient: ${recipientEmail}`);
        this.logger.log(`SMTP Host: ${process.env.SMTP_HOST}`);
        this.logger.log(`SMTP Port: ${process.env.SMTP_PORT}`);
        this.logger.log(`SMTP User: ${process.env.SMTP_USER}`);
        this.logger.log(`Recipient Email: ${recipientEmail}`);
        this.logger.log(`OTP Generated: ${otpCode}`);
        if (!this.transporter) {
            const errorMsg = 'SMTP Transporter is not initialized';
            this.logger.error(`SMTP Verify Failure: ${errorMsg}`);
            throw new Error(errorMsg);
        }
        try {
            this.logger.log('Verifying SMTP connection before sending email...');
            await this.transporter.verify();
            this.logger.log('SMTP Verify Success');
        }
        catch (err) {
            this.logger.error(`SMTP Verify Failure: ${err.message}`, err.stack);
            throw new Error(`SMTP Verification Failed: ${err.message}`);
        }
        const fromName = process.env.SMTP_FROM_NAME || 'Amdox ERP';
        const fromEmail = process.env.SMTP_FROM_EMAIL || 'pakkuzi19@gmail.com';
        const expiryTime = process.env.OTP_EXPIRY_MINUTES || '5';
        const subject = 'Verify Your Email Address';
        const textBody = `Hello ${firstName},

Your OTP verification code is:

${otpCode}

This OTP expires in ${expiryTime} minutes.

If you did not request this, please ignore this email.

Regards,
Amdox ERP`;
        const htmlBody = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.5px;">Amdox ERP</h2>
            <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0; font-weight: 500;">Secure Cloud Enterprise Resource Planning</p>
          </div>
          
          <p style="font-size: 16px; line-height: 24px; color: #334155; margin: 0 0 24px 0;">
            Hello <strong>${firstName}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 24px; color: #334155; margin: 0 0 32px 0;">
            Your OTP verification code is:
          </p>
          
          <div style="text-align: center; margin: 0 0 32px 0;">
            <div style="display: inline-block; font-family: monospace; font-size: 38px; font-weight: 800; color: #2563eb; letter-spacing: 8px; padding: 16px 32px; background-color: #eff6ff; border: 1px dashed #2563eb; border-radius: 12px; line-height: 1;">
              ${otpCode}
            </div>
          </div>
          
          <p style="font-size: 14px; line-height: 20px; color: #64748b; margin: 0 0 32px 0; text-align: center;">
            This OTP expires in <strong>${expiryTime}</strong> minutes.
          </p>
          
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 0 0 32px 0;">
            <p style="font-size: 13px; line-height: 20px; color: #475569; margin: 0; text-align: center;">
              If you did not request this, please ignore this email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
            <p style="font-size: 14px; color: #475569; margin: 0 0 8px 0; font-weight: 600;">Regards,</p>
            <p style="font-size: 14px; color: #0f172a; margin: 0 0 24px 0; font-weight: 700;">Amdox ERP</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">This is an automated security message. Please do not reply directly.</p>
          </div>
        </div>
      </div>
    `;
        try {
            const info = await this.transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: recipientEmail,
                subject: subject,
                text: textBody,
                html: htmlBody,
            });
            this.logger.log('Email Sent');
            this.logger.log(`Message ID: ${info.messageId}`);
        }
        catch (err) {
            this.logger.error(`SMTP Error: ${err.message}`, err.stack);
            throw err;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map