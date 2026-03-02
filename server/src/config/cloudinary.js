// ============================================================
// CPMS – Cloudinary / Local Upload Config (src/config/cloudinary.js)
// Auto-detects: uses Cloudinary if env vars are set, else local disk
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const USE_CLOUDINARY =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

let uploadResume, uploadCertificate, uploadPhoto, uploadNotice;

if (USE_CLOUDINARY) {
    // ── Cloudinary path ─────────────────────────────────────
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const resumeStorage = new CloudinaryStorage({
        cloudinary,
        params: { folder: 'cpms/resumes', resource_type: 'raw', allowed_formats: ['pdf', 'doc', 'docx'] },
    });

    const certificateStorage = new CloudinaryStorage({
        cloudinary,
        params: { folder: 'cpms/certificates', resource_type: 'raw', allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'] },
    });

    const photoStorage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'cpms/photos',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 400, height: 400, crop: 'fill' }],
        },
    });

    const noticeStorage = new CloudinaryStorage({
        cloudinary,
        params: { folder: 'cpms/notices', resource_type: 'raw', allowed_formats: ['pdf'] },
    });

    uploadResume = multer({ storage: resumeStorage });
    uploadCertificate = multer({ storage: certificateStorage });
    uploadPhoto = multer({ storage: photoStorage });
    uploadNotice = multer({ storage: noticeStorage });

    module.exports = { cloudinary, uploadResume, uploadCertificate, uploadPhoto, uploadNotice, isCloudinary: true };
} else {
    // ── Local disk-storage fallback ─────────────────────────
    console.warn('[UPLOAD] Cloudinary env vars not set – using local disk storage under /uploads');

    const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

    const makeLocalStorage = (subfolder, allowedExts) => {
        const dir = path.join(UPLOAD_ROOT, subfolder);
        fs.mkdirSync(dir, { recursive: true });

        return multer.diskStorage({
            destination: (_req, _file, cb) => cb(null, dir),
            filename: (_req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, `${uniqueSuffix}${ext}`);
            },
        });
    };

    const fileFilter = (allowedExts) => (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Only ${allowedExts.join(', ')} files are allowed`), false);
        }
    };

    uploadResume = multer({
        storage: makeLocalStorage('resumes', ['pdf', 'doc', 'docx']),
        fileFilter: fileFilter(['pdf', 'doc', 'docx']),
        limits: { fileSize: 10 * 1024 * 1024 },
    });

    uploadCertificate = multer({
        storage: makeLocalStorage('certificates', ['pdf', 'jpg', 'jpeg', 'png']),
        fileFilter: fileFilter(['pdf', 'jpg', 'jpeg', 'png']),
        limits: { fileSize: 5 * 1024 * 1024 },
    });

    uploadPhoto = multer({
        storage: makeLocalStorage('photos', ['jpg', 'jpeg', 'png', 'webp']),
        fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'webp']),
        limits: { fileSize: 5 * 1024 * 1024 },
    });

    uploadNotice = multer({
        storage: makeLocalStorage('notices', ['pdf']),
        fileFilter: fileFilter(['pdf']),
        limits: { fileSize: 10 * 1024 * 1024 },
    });

    module.exports = { uploadResume, uploadCertificate, uploadPhoto, uploadNotice, isCloudinary: false };
}
