const mammoth = require('mammoth');
const { AI_LIMITS } = require('../constants/ai');
const {
  extractTextFromMaterial,
  validateDocxArchive
} = require('../services/ragService');

const ZIP_LOCAL_SIGNATURE = 0x04034b50;
const ZIP_CENTRAL_SIGNATURE = 0x02014b50;
const ZIP_END_SIGNATURE = 0x06054b50;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createStoredZip(entries) {
  const localRecords = [];
  const centralRecords = [];
  let localOffset = 0;

  for (const [filename, value] of entries) {
    const name = Buffer.from(filename, 'utf8');
    const content = Buffer.from(value, 'utf8');
    const checksum = crc32(content);
    const local = Buffer.alloc(30 + name.length + content.length);
    local.writeUInt32LE(ZIP_LOCAL_SIGNATURE, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(content.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(name.length, 26);
    name.copy(local, 30);
    content.copy(local, 30 + name.length);

    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(ZIP_CENTRAL_SIGNATURE, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(content.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(localOffset, 42);
    name.copy(central, 46);

    localRecords.push(local);
    centralRecords.push(central);
    localOffset += local.length;
  }

  const centralOffset = localOffset;
  const centralSize = centralRecords.reduce((sum, record) => sum + record.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(ZIP_END_SIGNATURE, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralOffset, 16);
  return Buffer.concat([...localRecords, ...centralRecords, end]);
}

function minimalDocx() {
  return createStoredZip([
    [
      '[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '</Types>'
    ],
    [
      '_rels/.rels',
      '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '</Relationships>'
    ],
    [
      'word/document.xml',
      '<?xml version="1.0" encoding="UTF-8"?>' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
        '<w:body><w:p><w:r><w:t>Safe DOCX text</w:t></w:r></w:p></w:body>' +
        '</w:document>'
    ]
  ]);
}

function endRecordOffset(buffer) {
  return buffer.length - 22;
}

describe('DOCX ZIP preflight', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('accepts and extracts a normal DOCX archive', async () => {
    const buffer = minimalDocx();
    expect(validateDocxArchive(buffer)).toEqual({
      entryCount: 3,
      totalUncompressedBytes: expect.any(Number)
    });

    await expect(extractTextFromMaterial({
      originalname: 'notes.docx',
      buffer
    })).resolves.toContain('Safe DOCX text');
  });

  test('rejects an excessive declared expanded size', () => {
    const buffer = minimalDocx();
    const centralOffset = buffer.readUInt32LE(endRecordOffset(buffer) + 16);
    buffer.writeUInt32LE(AI_LIMITS.docxArchiveUncompressedBytesMax + 1, centralOffset + 24);

    expect(() => validateDocxArchive(buffer)).toThrow(/safe processing limit/i);
  });

  test('rejects an excessive declared entry count before walking entries', () => {
    const buffer = minimalDocx();
    const endOffset = endRecordOffset(buffer);
    const excessiveCount = AI_LIMITS.docxArchiveEntriesMax + 1;
    buffer.writeUInt16LE(excessiveCount, endOffset + 8);
    buffer.writeUInt16LE(excessiveCount, endOffset + 10);

    expect(() => validateDocxArchive(buffer)).toThrow(/too many entries/i);
  });

  test('rejects malformed structure before calling Mammoth', async () => {
    const buffer = minimalDocx();
    const centralOffset = buffer.readUInt32LE(endRecordOffset(buffer) + 16);
    buffer.writeUInt32LE(0, centralOffset);
    const extractSpy = jest.spyOn(mammoth, 'extractRawText');

    await expect(extractTextFromMaterial({
      originalname: 'malformed.docx',
      buffer
    })).rejects.toThrow(/could not be parsed safely/i);
    expect(extractSpy).not.toHaveBeenCalled();
  });
});
