import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // List notifications for user
  async getNotifications(userId: bigint, currentUser: any) {
    this.verifyUser(userId, currentUser);
    return this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  // Get unread notification counts
  async getUnreadCount(userId: bigint, currentUser: any) {
    this.verifyUser(userId, currentUser);
    const count = await this.prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
    return { count };
  }

  // Mark single as read
  async markAsRead(notificationId: bigint, currentUser: any) {
    const notification = await this.prisma.notification.findUnique({ where: { notification_id: notificationId } });
    if (!notification) throw new NotFoundException('Notification not found');
    this.verifyUser(notification.user_id, currentUser);

    return this.prisma.notification.update({
      where: { notification_id: notificationId },
      data: { is_read: true },
    });
  }

  // Mark all as read
  async markAllAsRead(userId: bigint, currentUser: any) {
    this.verifyUser(userId, currentUser);
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  }

  // Safety checker
  private verifyUser(userId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (BigInt(currentUser.id) !== userId) {
      throw new ForbiddenException('Cannot access notifications of another user');
    }
  }
}
