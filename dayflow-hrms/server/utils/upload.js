const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const profilePictureDir = path.join(__dirname, '../../uploads/profile-pictures');
const documentsDir = path.join(__dirname, '../../uploads/documents');
ensureDir(profilePictureDir);
ensureDir(documentsDir);

// Dynamic storage based on fieldname
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      cb(null, profilePictureDir);
    } else {
      cb(null, documentsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePicture') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Profile picture must be an image file'), false);
    }
  } else {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Documents must be PDF, JPG, or PNG'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
