const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const upload = require('../utils/upload');

// Multer fields: profilePicture (single) + documents (multiple, up to 10)
const uploadFields = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
]);

// GET routes
router.get('/me', authMiddleware, profileController.getMyProfile);
router.get('/:userId', authMiddleware, checkRole(['Admin', 'HR_Officer']), profileController.getUserProfile);

// PUT routes
router.put('/me', authMiddleware, uploadFields, profileController.updateMyProfile);
router.put('/:userId', authMiddleware, checkRole(['Admin', 'HR_Officer']), uploadFields, profileController.updateUserProfile);

module.exports = router;
