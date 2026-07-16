const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Sensitive documents (recommendation letters) — separate from general uploads
const gradeDocDir = path.join(__dirname, '..', 'uploads', 'grade-documents');
if (!fs.existsSync(gradeDocDir)) fs.mkdirSync(gradeDocDir, { recursive: true });

// Tutor learning materials — separate folder, not mixed with sensitive docs
const materialsDir = path.join(__dirname, '..', 'uploads', 'materials');
if (!fs.existsSync(materialsDir)) fs.mkdirSync(materialsDir, { recursive: true });

const makeStorage = (dir) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const documentFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'), false);
};

const materialFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
};

// For recommendation letter uploads (sensitive — encrypted at rest)
const upload = multer({
  storage: makeStorage(gradeDocDir),
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// For tutor material uploads (non-sensitive — not encrypted)
const uploadMaterial = multer({
  storage: makeStorage(materialsDir),
  fileFilter: materialFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = upload;
module.exports.uploadMaterial = uploadMaterial;
module.exports.gradeDocDir = gradeDocDir;
module.exports.materialsDir = materialsDir;
