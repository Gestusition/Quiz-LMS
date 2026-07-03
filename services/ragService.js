const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const aiMaterialRepository = require('../repositories/aiMaterialRepository');
const { callEmbeddings } = require('./azureOpenAIClient');
const { validationError } = require('../utils/appError');

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 500000;
const MAX_CHUNKS = 250;
const CHUNK_SIZE = 1400;
const CHUNK_OVERLAP = 200;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.md', '.docx']);

async function ingestCourseMaterial(courseId, file, config, userId) {
  validateMaterialFile(file);
  const cleanFile = {
    ...file,
    originalname: sanitizeFilename(file.originalname),
    originalName: sanitizeFilename(file.originalname),
    mimeType: file.mimetype || 'application/octet-stream',
    byteSize: file.size || file.buffer.length
  };
  const text = await extractTextFromMaterial(cleanFile);
  const chunks = chunkText(text);
  if (!chunks.length) throw validationError('file', 'No readable text was found in the uploaded material.');
  const embeddings = await createEmbeddings(chunks, config);
  return storeEmbeddings(courseId, cleanFile, chunks, embeddings, userId);
}

async function extractTextFromMaterial(file) {
  const extension = path.extname(file.originalname || file.originalName).toLowerCase();
  try {
    let text = '';
    if (extension === '.pdf') {
      text = (await pdfParse(file.buffer, { max: 0 })).text || '';
    } else if (extension === '.docx') {
      text = (await mammoth.extractRawText({ buffer: file.buffer })).value || '';
    } else {
      text = file.buffer.toString('utf8');
    }
    return normalizeText(text).slice(0, MAX_EXTRACTED_CHARS);
  } catch (error) {
    throw validationError('file', 'The uploaded material could not be parsed safely.');
  }
}

function chunkText(text, options = {}) {
  const size = options.size || CHUNK_SIZE;
  const overlap = Math.min(options.overlap ?? CHUNK_OVERLAP, size - 1);
  const normalized = normalizeText(text);
  if (!normalized) return [];
  const chunks = [];
  let cursor = 0;
  while (cursor < normalized.length && chunks.length < MAX_CHUNKS) {
    let end = Math.min(cursor + size, normalized.length);
    if (end < normalized.length) {
      const boundary = Math.max(normalized.lastIndexOf('\n', end), normalized.lastIndexOf('. ', end));
      if (boundary > cursor + Math.floor(size * 0.55)) end = boundary + 1;
    }
    const chunk = normalized.slice(cursor, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;
    cursor = Math.max(cursor + 1, end - overlap);
  }
  return chunks;
}

async function createEmbeddings(chunks, config) {
  const embeddings = [];
  for (let index = 0; index < chunks.length; index += 16) {
    embeddings.push(...await callEmbeddings(chunks.slice(index, index + 16), config));
  }
  return embeddings;
}

function storeEmbeddings(courseId, file, chunks, embeddings, userId) {
  if (chunks.length !== embeddings.length) throw new Error('Embedding count mismatch.');
  return aiMaterialRepository.storeMaterialWithChunks(courseId, file, chunks, embeddings, userId);
}

async function retrieveRelevantChunks(courseId, topic, config, limit = 6) {
  const rows = aiMaterialRepository.listChunksByCourse(courseId);
  if (!rows.length) return [];
  const [queryEmbedding] = await callEmbeddings([String(topic).slice(0, 500)], config);
  return rows.map(row => ({
    id: row.id,
    materialId: row.materialId,
    content: row.content,
    sourceLabel: row.sourceLabel,
    score: cosineSimilarity(queryEmbedding, safeVector(row.embeddingJson))
  }))
    .filter(row => Number.isFinite(row.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 10));
}

function listCourseMaterials(courseId) {
  return aiMaterialRepository.listByCourse(courseId);
}

function validateMaterialFile(file) {
  if (!file || !Buffer.isBuffer(file.buffer)) throw validationError('file', 'Course material file is required.');
  if (file.buffer.length === 0 || file.buffer.length > MAX_FILE_BYTES) {
    throw validationError('file', 'Course material must be between 1 byte and 10 MB.');
  }
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw validationError('file', 'Upload a PDF, TXT, Markdown, or DOCX file.');
  }
  if (extension === '.pdf' && file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw validationError('file', 'The file content is not a valid PDF.');
  }
  if (extension === '.docx' && !file.buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
    throw validationError('file', 'The file content is not a valid DOCX document.');
  }
  if (['.txt', '.md'].includes(extension) && file.buffer.includes(0)) {
    throw validationError('file', 'Text course material cannot contain binary data.');
  }
}

function sanitizeFilename(name) {
  return path.basename(String(name || 'material')).replace(/[^A-Za-z0-9._ -]/g, '_').slice(0, 180) || 'material';
}

function normalizeText(text) {
  return String(text || '').replace(/\r\n?/g, '\n').replace(/[\t ]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function safeVector(value) {
  try {
    const vector = JSON.parse(value);
    return Array.isArray(vector) ? vector : [];
  } catch (error) {
    return [];
  }
}

function cosineSimilarity(left, right) {
  if (!left.length || left.length !== right.length) return Number.NEGATIVE_INFINITY;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }
  if (!leftNorm || !rightNorm) return Number.NEGATIVE_INFINITY;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

module.exports = {
  ALLOWED_EXTENSIONS,
  chunkText,
  createEmbeddings,
  extractTextFromMaterial,
  ingestCourseMaterial,
  listCourseMaterials,
  retrieveRelevantChunks,
  sanitizeFilename,
  storeEmbeddings,
  validateMaterialFile
};
