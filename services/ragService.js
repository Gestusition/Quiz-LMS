const path = require('path');
const zlib = require('zlib');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const aiMaterialRepository = require('../repositories/aiMaterialRepository');
const { callEmbeddings } = require('./azureOpenAIClient');
const { validationError } = require('../utils/appError');
const { AI_LIMITS } = require('../constants/ai');

const MAX_FILE_BYTES = AI_LIMITS.materialFileBytesMax;
const MAX_EXTRACTED_CHARS = AI_LIMITS.materialExtractedCharsMax;
const MAX_PASTED_CHARS = AI_LIMITS.pastedMaterialCharsMax;
const MAX_CHUNKS = AI_LIMITS.materialChunksMax;
const CHUNK_SIZE = AI_LIMITS.materialChunkSize;
const CHUNK_OVERLAP = AI_LIMITS.materialChunkOverlap;
const MAX_DOCX_ENTRIES = AI_LIMITS.docxArchiveEntriesMax;
const MAX_DOCX_UNCOMPRESSED_BYTES = AI_LIMITS.docxArchiveUncompressedBytesMax;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.md', '.docx']);

async function ingestCourseMaterial(courseId, file, config, userId, options = {}) {
  validateMaterialFile(file);
  const cleanFile = {
    ...file,
    originalname: sanitizeFilename(file.originalname),
    originalName: sanitizeFilename(file.originalname),
    mimeType: file.mimetype || 'application/octet-stream',
    byteSize: file.size || file.buffer.length
  };
  const text = await extractTextFromMaterial(cleanFile, { docxArchiveValidated: true });
  const chunks = chunkText(text);
  if (!chunks.length) throw validationError('file', 'No readable text was found in the uploaded material.');
  const embeddings = await createEmbeddings(chunks, config, options);
  return storeEmbeddings(courseId, cleanFile, chunks, embeddings, userId);
}

async function ingestPastedMaterial(courseId, input, config, userId) {
  const title = sanitizeFilename(String(input?.title || 'Pasted course notes').trim());
  const content = normalizeText(input?.content);
  if (!content) throw validationError('content', 'Paste some course material before indexing.');
  if (content.length > MAX_PASTED_CHARS) {
    throw validationError('content', `Pasted course material must be ${MAX_PASTED_CHARS.toLocaleString()} characters or less.`);
  }
  const file = {
    originalname: title.toLowerCase().endsWith('.txt') ? title : `${title}.txt`,
    mimetype: 'text/plain',
    size: Buffer.byteLength(content, 'utf8'),
    buffer: Buffer.from(content, 'utf8'),
    sourceType: 'pasted_text'
  };
  return ingestCourseMaterial(courseId, file, config, userId);
}

async function extractTextFromMaterial(file, options = {}) {
  const extension = path.extname(file.originalname || file.originalName).toLowerCase();
  try {
    let text = '';
    if (extension === '.pdf') {
      text = (await pdfParse(file.buffer, { max: 0 })).text || '';
    } else if (extension === '.docx') {
      if (!options.docxArchiveValidated) validateDocxArchive(file.buffer);
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

async function createEmbeddings(chunks, config, options = {}) {
  const embeddings = [];
  for (let index = 0; index < chunks.length; index += 16) {
    embeddings.push(...await callEmbeddings(chunks.slice(index, index + 16), config, options));
  }
  return embeddings;
}

function storeEmbeddings(courseId, file, chunks, embeddings, userId) {
  if (chunks.length !== embeddings.length) throw new Error('Embedding count mismatch.');
  return aiMaterialRepository.storeMaterialWithChunks(courseId, file, chunks, embeddings, userId);
}

async function retrieveRelevantChunks(
  courseId,
  topic,
  config,
  limit = AI_LIMITS.retrievedChunksDefault,
  materialIds = [],
  options = {}
) {
  const selectedIds = Array.isArray(materialIds)
    ? [...new Set(materialIds.map(Number).filter(Number.isInteger).filter(id => id > 0))].slice(0, 50)
    : [];
  const rows = aiMaterialRepository.listChunksByCourse(courseId, { materialIds: selectedIds });
  if (!rows.length) return [];
  const [queryEmbedding] = await callEmbeddings(
    [String(topic).slice(0, 500)],
    config,
    options
  );
  options.onStage?.('selecting_source_passages');
  return rows.map(row => ({
    id: row.id,
    materialId: row.materialId,
    content: row.content,
    sourceLabel: row.sourceLabel,
    score: cosineSimilarity(queryEmbedding, safeVector(row.embeddingJson))
  }))
    .filter(row => Number.isFinite(row.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), AI_LIMITS.retrievedChunksMax));
}

function listCourseMaterials(courseId) {
  return aiMaterialRepository.listByCourse(courseId);
}

function removeCourseMaterial(courseId, materialId) {
  const material = aiMaterialRepository.getMaterial(materialId);
  if (!material || Number(material.courseId) !== Number(courseId)) {
    throw validationError('materialId', 'Course material was not found.');
  }
  aiMaterialRepository.deleteMaterialForCourse(materialId, courseId);
  return { id: Number(materialId), removed: true };
}

function getSourceChunk(courseId, materialIdOrChunkId, maybeChunkId) {
  const chunkId = maybeChunkId === undefined ? materialIdOrChunkId : maybeChunkId;
  const materialId = maybeChunkId === undefined ? null : materialIdOrChunkId;
  const row = aiMaterialRepository.getChunkById(chunkId);
  if (
    !row ||
    Number(row.courseId) !== Number(courseId) ||
    (materialId !== null && Number(row.materialId) !== Number(materialId))
  ) {
    throw validationError('chunkId', 'Course material source was not found.');
  }
  return {
    id: row.id,
    materialId: row.materialId,
    courseId: row.courseId,
    sourceLabel: row.sourceLabel,
    chunkIndex: row.chunkIndex,
    content: row.content,
    excerpt: row.content
  };
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
  if (extension === '.docx') validateDocxArchive(file.buffer);
  if (['.txt', '.md'].includes(extension) && file.buffer.includes(0)) {
    throw validationError('file', 'Text course material cannot contain binary data.');
  }
}

function validateDocxArchive(buffer) {
  if (
    !Buffer.isBuffer(buffer) ||
    buffer.length < 22 ||
    buffer.readUInt32LE(0) !== 0x04034b50
  ) {
    throw validationError('file', 'The DOCX archive is malformed.');
  }
  const eocdOffset = findZipEndOfCentralDirectory(buffer);
  if (eocdOffset < 0 || eocdOffset + 22 > buffer.length) {
    throw validationError('file', 'The DOCX archive is malformed.');
  }
  const diskNumber = buffer.readUInt16LE(eocdOffset + 4);
  const centralDisk = buffer.readUInt16LE(eocdOffset + 6);
  const entriesOnDisk = buffer.readUInt16LE(eocdOffset + 8);
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralSize = buffer.readUInt32LE(eocdOffset + 12);
  const centralOffset = buffer.readUInt32LE(eocdOffset + 16);
  if (
    diskNumber !== 0 ||
    centralDisk !== 0 ||
    entriesOnDisk !== entryCount ||
    entryCount < 1 ||
    entryCount > MAX_DOCX_ENTRIES ||
    centralOffset + centralSize !== eocdOffset
  ) {
    throw validationError('file', 'The DOCX archive is malformed or contains too many entries.');
  }

  let cursor = centralOffset;
  let expandedBytes = 0;
  let hasContentTypes = false;
  let hasDocument = false;
  const entryNames = new Set();
  const localRanges = [];
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > eocdOffset || buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw validationError('file', 'The DOCX archive has an invalid central directory.');
    }
    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const declaredSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const nextCursor = cursor + 46 + nameLength + extraLength + commentLength;
    if (
      nextCursor > eocdOffset ||
      compressedSize === 0xffffffff ||
      declaredSize === 0xffffffff ||
      localOffset === 0xffffffff ||
      nameLength < 1 ||
      (flags & 0x2041) !== 0 ||
      ![0, 8].includes(method)
    ) {
      throw validationError('file', 'The DOCX archive uses an unsupported or unsafe ZIP format.');
    }
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    if (!name || name.includes('\0') || /(^|\/)\.\.(?:\/|$)/.test(name) || /^[\\/]/.test(name)) {
      throw validationError('file', 'The DOCX archive contains an unsafe entry path.');
    }
    if (entryNames.has(name)) {
      throw validationError('file', 'The DOCX archive contains duplicate entries.');
    }
    entryNames.add(name);
    hasContentTypes ||= name === '[Content_Types].xml';
    hasDocument ||= name === 'word/document.xml';

    const remaining = MAX_DOCX_UNCOMPRESSED_BYTES - expandedBytes;
    if (declaredSize > remaining) {
      throw validationError('file', 'The DOCX archive expands beyond the safe processing limit.');
    }

    if (localOffset + 30 > centralOffset || buffer.readUInt32LE(localOffset) !== 0x04034b50) {
      throw validationError('file', 'The DOCX archive contains an invalid local file entry.');
    }
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const localFlags = buffer.readUInt16LE(localOffset + 6);
    const localMethod = buffer.readUInt16LE(localOffset + 8);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataOffset + compressedSize;
    const localName = buffer.subarray(localOffset + 30, localOffset + 30 + localNameLength);
    if (
      dataOffset > centralOffset ||
      dataEnd < dataOffset ||
      dataEnd > centralOffset ||
      localFlags !== flags ||
      localMethod !== method ||
      localNameLength !== nameLength ||
      !localName.equals(buffer.subarray(cursor + 46, cursor + 46 + nameLength))
    ) {
      throw validationError('file', 'The DOCX archive contains an invalid compressed entry.');
    }
    if ((localFlags & 0x0008) === 0) {
      const localCompressedSize = buffer.readUInt32LE(localOffset + 18);
      const localDeclaredSize = buffer.readUInt32LE(localOffset + 22);
      if (localCompressedSize !== compressedSize || localDeclaredSize !== declaredSize) {
        throw validationError('file', 'The DOCX archive contains inconsistent entry sizes.');
      }
    }
    localRanges.push({ start: localOffset, end: dataEnd });

    let actualSize;
    try {
      actualSize = method === 0
        ? compressedSize
        : zlib.inflateRawSync(
            buffer.subarray(dataOffset, dataEnd),
            { maxOutputLength: remaining + 1 }
          ).length;
    } catch (error) {
      throw validationError('file', 'The DOCX archive could not be decompressed safely.');
    }
    if (actualSize !== declaredSize) {
      throw validationError('file', 'The DOCX archive contains inconsistent entry sizes.');
    }
    expandedBytes += actualSize;
    cursor = nextCursor;
  }
  if (cursor !== centralOffset + centralSize || !hasContentTypes || !hasDocument) {
    throw validationError('file', 'The uploaded ZIP is not a valid DOCX document.');
  }
  localRanges.sort((left, right) => left.start - right.start);
  for (let index = 1; index < localRanges.length; index += 1) {
    if (localRanges[index].start < localRanges[index - 1].end) {
      throw validationError('file', 'The DOCX archive contains overlapping entries.');
    }
  }
  return { entryCount, totalUncompressedBytes: expandedBytes };
}

function findZipEndOfCentralDirectory(buffer) {
  const minimum = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (
      buffer.readUInt32LE(offset) === 0x06054b50 &&
      offset + 22 + buffer.readUInt16LE(offset + 20) === buffer.length
    ) {
      return offset;
    }
  }
  return -1;
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
  MAX_PASTED_CHARS,
  chunkText,
  createEmbeddings,
  extractTextFromMaterial,
  getSourceChunk,
  ingestCourseMaterial,
  ingestPastedMaterial,
  listCourseMaterials,
  removeCourseMaterial,
  retrieveRelevantChunks,
  sanitizeFilename,
  storeEmbeddings,
  validateDocxArchive,
  validateMaterialFile
};
