// ============================================================
// CPMS – Student Routes (src/routes/studentRoutes.js)
// All routes require a valid JWT (protect middleware)
// ============================================================

const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
    getProfile,
    updateProfile,
    uploadResume,
    uploadPhoto,
    getStats,
    getApplications,
    getAllStudents
} = require('../controllers/studentController');

const {
    getCertificates,
    addCertificate,
    deleteCertificate,
} = require('../controllers/certificateController');

const {
    uploadResume: multerResume,
    uploadCertificate: multerCert,
    uploadPhoto: multerPhoto,
} = require('../config/cloudinary');

// ── TPO Admin Routes ────────────────────────────────────────
// Must be declared before /profile to avoid parameter mistaking if we ever add /:id
router.get('/all', protect, requireRole('TPO_ADMIN'), getAllStudents);

// ── All paths below require STUDENT role ────────────────────
router.use(protect);
router.use(requireRole('STUDENT'));

// ── Profile ─────────────────────────────────────────────────
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// ── Stats (for dashboard) ────────────────────────────────────
router.get('/stats', getStats);

// ── Applications (drive registrations) ───────────────────────
router.get('/applications', getApplications);

// ── Resume / Photo uploads ───────────────────────────────────
router.post('/resume', multerResume.single('resume'), uploadResume);
router.post('/photo', multerPhoto.single('photo'), uploadPhoto);

// ── Certificates ─────────────────────────────────────────────
router.get('/certificates', getCertificates);
router.post('/certificates', multerCert.single('file'), addCertificate);
router.delete('/certificates/:id', deleteCertificate);

module.exports = router;
