// ============================================================
// CPMS – Notification Controller (src/controllers/notificationController.js)
// Handles: Fetching alerts, marking as read, and admin broadcasts.
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// ── Zod Schemas ─────────────────────────────────────────────
const broadcastSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).default('INFO'),
    targetBranch: z.string().optional(), // 'ALL' or empty means all branches
});

// ────────────────────────────────────────────────────────────
// GET /api/notifications  (protected: Any authenticated user)
// ────────────────────────────────────────────────────────────
const getMyNotifications = async (req, res) => {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to 50 most recent for performance
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.json({
        success: true,
        unreadCount,
        notifications
    });
};

// ────────────────────────────────────────────────────────────
// PATCH /api/notifications/:id/read  (protected: Any authenticated user)
// ────────────────────────────────────────────────────────────
const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this notification' });
    }

    const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });

    return res.json({ success: true, notification: updated });
};

// ────────────────────────────────────────────────────────────
// PATCH /api/notifications/read-all  (protected: Any authenticated user)
// ────────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
    const userId = req.user.id;

    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });

    return res.json({ success: true, message: 'All notifications marked as read' });
};

// ────────────────────────────────────────────────────────────
// POST /api/notifications/broadcast  (protected: TPO_ADMIN)
// ────────────────────────────────────────────────────────────
// Creates a notification for all students, or specifically targeted by branch
const broadcastNotification = async (req, res) => {
    // Validate Input
    const parsed = broadcastSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    }

    const { title, message, type, targetBranch } = parsed.data;

    // Find Target Users
    let usersQuery = { role: 'STUDENT' };

    // If a specific branch is targeted, we need to join through the Student table
    if (targetBranch && targetBranch !== 'ALL') {
        const studentsInBranch = await prisma.student.findMany({
            where: { branch: targetBranch },
            select: { userId: true }
        });
        const userIds = studentsInBranch.map(s => s.userId);

        if (userIds.length === 0) {
            return res.status(404).json({ success: false, message: `No students found in branch ${targetBranch}` });
        }
        usersQuery.id = { in: userIds };
    }

    const targetUsers = await prisma.user.findMany({
        where: usersQuery,
        select: { id: true }
    });

    if (targetUsers.length === 0) {
        return res.status(404).json({ success: false, message: 'No active students found to broadcast to.' });
    }

    // Prepare Bulk Insert
    const notificationData = targetUsers.map(u => ({
        userId: u.id,
        title,
        message,
        type,
        isRead: false
    }));

    await prisma.notification.createMany({
        data: notificationData
    });

    return res.status(201).json({
        success: true,
        message: `Broadcast sent successfully to ${notificationData.length} students.`
    });
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    broadcastNotification
};
