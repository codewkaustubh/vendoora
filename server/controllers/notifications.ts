import { Response } from 'express';
import { prisma } from '../config/db';

export function buildNotificationData(userId: string, title: string, message: string, type: string) {
  return { userId, title, message, type, time: 'Just now', read: false };
}

export async function createNotification(userId: string, title: string, message: string, type: string) {
  return prisma.notification.create({
    data: buildNotificationData(userId, title, message, type),
  });
}

export function canReadNotification(notification: { userId: string } | null, userId: string): boolean {
  return Boolean(notification && notification.userId === userId);
}

export function isUnread(notification: { read: boolean }): boolean {
  return !notification.read;
}

export async function getUserNotifications(req: any, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ notifications });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching notifications' });
  }
}

export async function markRead(req: any, res: Response) {
  try {
    const { id } = req.params;

    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (!canReadNotification(notif, req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: You do not own this notification' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error marking notification read' });
  }
}

export async function markAllRead(req: any, res: Response) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true, readAt: new Date() },
    });

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error marking all notifications read' });
  }
}
