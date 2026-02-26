// ============================================================
// CPMS – Cloudinary Config (src/config/cloudinary.js)
// ============================================================

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary SDK
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage for resumes / PDFs ───────────────────────────────
const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cpms/resumes',
        resource_type: 'raw',           // for non-image files (PDF, DOCX)
        allowed_formats: ['pdf', 'doc', 'docx'],
    },
});

// ── Storage for certificates ─────────────────────────────────
const certificateStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cpms/certificates',
        resource_type: 'raw',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
});

// ── Storage for profile photos ───────────────────────────────
const photoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cpms/photos',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
    },
});

// ── Storage for company notices (PDFs) ───────────────────────
const noticeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cpms/notices',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
    },
});

// ── Multer upload instances ───────────────────────────────────
const uploadResume = multer({ storage: resumeStorage });
const uploadCertificate = multer({ storage: certificateStorage });
const uploadPhoto = multer({ storage: photoStorage });
const uploadNotice = multer({ storage: noticeStorage });

module.exports = {
    cloudinary,
    uploadResume,
    uploadCertificate,
    uploadPhoto,
    uploadNotice,
};
