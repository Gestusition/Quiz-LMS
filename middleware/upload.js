const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

function removeUploadedFile(file) {
  if (!file || !file.path) return;
  try {
    fs.unlinkSync(file.path);
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

module.exports = { upload, validateUploadedImage };
