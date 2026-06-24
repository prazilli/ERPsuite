import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getNotifications(userId: bigint, currentUser: any): Promise<{
        message: string;
        user_id: bigint;
        created_at: Date;
        notification_id: bigint;
        title: string;
        is_read: boolean;
    }[]>;
    getUnreadCount(userId: bigint, currentUser: any): Promise<{
        count: number;
    }>;
    markAsRead(notificationId: bigint, currentUser: any): Promise<{
        message: string;
        user_id: bigint;
        created_at: Date;
        notification_id: bigint;
        title: string;
        is_read: boolean;
    }>;
    markAllAsRead(userId: bigint, currentUser: any): Promise<{
        success: boolean;
    }>;
    private verifyUser;
}
