import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: any): Promise<{
        message: string;
        user_id: bigint;
        created_at: Date;
        notification_id: bigint;
        title: string;
        is_read: boolean;
    }[]>;
    getUnreadCount(user: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, user: any): Promise<{
        message: string;
        user_id: bigint;
        created_at: Date;
        notification_id: bigint;
        title: string;
        is_read: boolean;
    }>;
    markAllAsRead(user: any): Promise<{
        success: boolean;
    }>;
}
