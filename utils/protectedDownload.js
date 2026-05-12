const fs = require('fs');
const path = require('path');

const SAFE_DOWNLOAD_HEADERS = Object.freeze({
  'Content-Type': 'application/octet-stream',
  'X-Content-Type-Options': 'nosniff',
  'X-Download-Options': 'noopen',
  'Content-Security-Policy': "sandbox; default-src 'none'; script-src 'none'; object-src 'none'; base-uri 'none'",
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache'
});

function safeAttachmentName(name, fallback = 'download') {
  const baseName = path.basename(String(name || fallback));
  const sanitized = baseName.replace(/[\x00-\x1F\x7F"\\/:*?<>|]+/g, '_').trim();
  return sanitized || fallback;
}

function resolveStoredFile(rootDir, storageUrl) {
  const storedName = path.basename(String(storageUrl || ''));
  if (!storedName) return null;

  const root = path.resolve(rootDir);
  const filePath = path.resolve(root, storedName);
  if (path.dirname(filePath) !== root) return null;
  return { filePath, storedName };
}

function sendProtectedDownload(res, fileInfo, rootDir, fallbackName = 'download') {
  const resolved = resolveStoredFile(rootDir, fileInfo && fileInfo.storageUrl);
  if (!resolved || !fs.existsSync(resolved.filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  const displayName = safeAttachmentName(
    fileInfo && fileInfo.fileName ? fileInfo.fileName : resolved.storedName,
    fallbackName
  );

  return res.download(resolved.filePath, displayName, {
    headers: SAFE_DOWNLOAD_HEADERS
  });
}

module.exports = {
  SAFE_DOWNLOAD_HEADERS,
  safeAttachmentName,
  sendProtectedDownload
};
