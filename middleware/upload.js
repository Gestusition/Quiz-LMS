const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { LIMITS } = require('../constants/limits');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
const resourceUploadDir = path.join(uploadDir, 'resources');
const submissionUploadDir = path.join(uploadDir, 'submissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(resourceUploadDir)) {
  fs.mkdirSync(resourceUploadDir, { recursive: true });
}
if (!fs.existsSync(submissionUploadDir)) {
  fs.mkdirSync(submissionUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, uploadDir); },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = new Map([
    ['.jpg', ['image/jpeg']],
    ['.jpeg', ['image/jpeg']],
    ['.png', ['image/png']],
    ['.gif', ['image/gif']],
    ['.webp', ['image/webp']]
  ]);
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.has(ext) && allowed.get(ext).includes(file.mimetype));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const resourceStorage = multer.diskStorage({
  destination(req, file, cb) { cb(null, resourceUploadDir); },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const resourceFileFilter = (req, file, cb) => {
  const allowed = new Map([
    ['.pdf', ['application/pdf']],
    ['.doc', ['application/msword', 'application/octet-stream']],
    ['.docx', ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream']],
    ['.xls', ['application/vnd.ms-excel', 'application/octet-stream']],
    ['.xlsx', ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream']],
    ['.ppt', ['application/vnd.ms-powerpoint', 'application/octet-stream']],
    ['.pptx', ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/octet-stream']],
    ['.csv', ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel']],
    ['.txt', ['text/plain']],
    ['.md', ['text/markdown', 'text/plain', 'application/octet-stream']],
    ['.html', ['text/html', 'application/xhtml+xml', 'text/plain', 'application/octet-stream']],
    ['.htm', ['text/html', 'application/xhtml+xml', 'text/plain', 'application/octet-stream']],
    ['.rtf', ['application/rtf', 'text/rtf']],
    ['.zip', ['application/zip', 'application/x-zip-compressed', 'application/octet-stream']],
    ['.jpg', ['image/jpeg']],
    ['.jpeg', ['image/jpeg']],
    ['.png', ['image/png']],
    ['.gif', ['image/gif']],
    ['.webp', ['image/webp']]
  ]);
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypes = allowed.get(ext);
  if (!mimeTypes || !mimeTypes.includes(file.mimetype)) {
    return cb(new Error('Unsupported resource file type.'));
  }
  cb(null, true);
};

const resourceUpload = multer({
  storage: resourceStorage,
  fileFilter: resourceFileFilter,
  limits: { fileSize: LIMITS.resources.fileSizeMaxBytes }
});

const submissionStorage = multer.diskStorage({
  destination(req, file, cb) { cb(null, submissionUploadDir); },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const submissionUpload = multer({
  storage: submissionStorage,
  fileFilter: resourceFileFilter,
  limits: { fileSize: LIMITS.assignments.submissionFileSizeMaxBytes }
});

const importFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypes = ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'];
  if (ext !== '.csv' || !mimeTypes.includes(file.mimetype)) {
    return cb(new Error('Unsupported import file type. Upload a CSV file.'));
  }
  cb(null, true);
};

const importUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: importFileFilter,
  limits: { fileSize: LIMITS.imports.fileSizeMaxBytes }
});

function removeUploadedFile(file) {
  if (!file || !file.path) return;
  try {
    fs.unlinkSync(file.path);
  } catch (err) {
    // Best-effort cleanup only.
  }
}

function removeUploadedResourceByUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/resources/')) return;
  const fileName = path.basename(url);
  const filePath = path.join(resourceUploadDir, fileName);
  if (!filePath.startsWith(resourceUploadDir)) return;
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    // Best-effort cleanup only.
  }
}

function removeUploadedSubmissionByUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/submissions/')) return;
  const fileName = path.basename(url);
  const filePath = path.join(submissionUploadDir, fileName);
  if (!filePath.startsWith(submissionUploadDir)) return;
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    // Best-effort cleanup only.
  }
}

function hasValidImageSignature(filePath, ext) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 12) return false;

  if (['.jpg', '.jpeg'].includes(ext)) {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;
  }
  if (ext === '.png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (ext === '.gif') {
    const header = buffer.subarray(0, 6).toString('ascii');
    return header === 'GIF87a' || header === 'GIF89a';
  }
  if (ext === '.webp') {
    return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

function validateUploadedImage(req, res, next) {
  if (!req.file) return next();
  const ext = path.extname(req.file.filename).toLowerCase();
  try {
    if (!hasValidImageSignature(req.file.path, ext)) {
      removeUploadedFile(req.file);
      req.file = null;
      return res.status(400).json({ error: 'Uploaded file content does not match an allowed image type.' });
    }
  } catch (err) {
    removeUploadedFile(req.file);
    req.file = null;
    return res.status(400).json({ error: 'Uploaded file could not be validated.' });
  }
  next();
}

function hasValidResourceSignature(filePath, ext) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length === 0) return false;

  if (ext === '.pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  if (['.zip', '.docx', '.xlsx', '.pptx'].includes(ext)) {
    const header = buffer.subarray(0, 4);
    return header.equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) ||
      header.equals(Buffer.from([0x50, 0x4b, 0x05, 0x06])) ||
      header.equals(Buffer.from([0x50, 0x4b, 0x07, 0x08]));
  }
  if (['.doc', '.xls', '.ppt'].includes(ext)) {
    return buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  }
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return hasValidImageSignature(filePath, ext);
  }
  if (['.txt', '.csv', '.md', '.html', '.htm'].includes(ext)) {
    return !buffer.includes(0);
  }
  if (ext === '.rtf') {
    return buffer.subarray(0, 5).toString('ascii') === '{\\rtf' || !buffer.includes(0);
  }
  return false;
}

function validateUploadedResource(req, res, next) {
  if (!req.file) return next();
  const ext = path.extname(req.file.filename).toLowerCase();
  try {
    if (!hasValidResourceSignature(req.file.path, ext)) {
      removeUploadedFile(req.file);
      req.file = null;
      return res.status(400).json({ error: 'Uploaded file content does not match the declared resource type.' });
    }
  } catch (err) {
    removeUploadedFile(req.file);
    req.file = null;
    return res.status(400).json({ error: 'Uploaded file could not be validated.' });
  }
  next();
}

module.exports = {
  upload,
  resourceUpload,
  submissionUpload,
  importUpload,
  removeUploadedFile,
  removeUploadedResourceByUrl,
  removeUploadedSubmissionByUrl,
  validateUploadedImage,
  validateUploadedResource
};
