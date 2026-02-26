// ============================================================
// CPMS – Certificate Controller (src/controllers/certificateController.js)
// Handles: list, add (with Cloudinary upload), and delete certificates
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// ── Zod: certificate metadata schema ───────────────────────
const addCertificateSchema = z.object({
    title: z.string().min(1, 'Certificate title is required').max(120),
    type: z.enum(['INTERNSHIP', 'TRAINING', 'OTHER'], {
        errorMap: () => ({ message: 'Type must be INTERNSHIP, TRAINING, or OTHER' }),
    }),
});

// ── Helper: resolve current student id from JWT userId ─────
const getStudentId = async (userId) => {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
    });
    return student?.id ?? null;
};

// ────────────────────────────────────────────────────────────
// GET /api/students/certificates  (protected: STUDENT)
// ────────────────────────────────────────────────────────────
const getCertificates = async (req, res) => {
    const studentId = await getStudentId(req.user.userId);
    if (!studentId) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const certificates = await prisma.certificate.findMany({
        where: { studentId },
        orderBy: { uploadedAt: 'desc' },
    });

    return res.json({ success: true, certificates });
};

// ────────────────────────────────────────────────────────────
// POST /api/students/certificates  (protected: STUDENT)
// Expects: multipart/form-data with `file`, `title`, `type`
// ────────────────────────────────────────────────────────────
const addCertificate = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const parsed = addCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const studentId = await getStudentId(req.user.userId);
    if (!studentId) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { title, type } = parsed.data;
    const fileUrl = req.file.path; // Cloudinary secure URL

    const certificate = await prisma.certificate.create({
        data: { studentId, title, type, fileUrl },
    });

    return res.status(201).json({
        success: true,
        message: 'Certificate uploaded successfully',
        certificate,
    });
};

// ────────────────────────────────────────────────────────────
// DELETE /api/students/certificates/:id  (protected: STUDENT)
// Verifies ownership before deletion
// ────────────────────────────────────────────────────────────
const deleteCertificate = async (req, res) => {
    const { id } = req.params;
    const studentId = await getStudentId(req.user.userId);

    if (!studentId) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check the certificate exists AND belongs to this student
    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert || cert.studentId !== studentId) {
        return res.status(404).json({
            success: false,
            message: 'Certificate not found or access denied',
        });
    }

    await prisma.certificate.delete({ where: { id } });

    return res.json({ success: true, message: 'Certificate deleted' });
};

module.exports = { getCertificates, addCertificate, deleteCertificate };
