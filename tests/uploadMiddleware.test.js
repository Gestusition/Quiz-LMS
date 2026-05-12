const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  removeUploadedFile,
  removeUploadedResourceByUrl,
  removeUploadedSubmissionByUrl,
  validateUploadedImage,
  validateUploadedResource
} = require('../middleware/upload');

let tempDir;

function makeFile(name, contents) {
  const filePath = path.join(tempDir, name);
  fs.writeFileSync(filePath, contents);
  return filePath;
}

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function runValidator(validator, file) {
  const req = { file };
  const res = responseRecorder();
  const next = jest.fn();
  validator(req, res, next);
  return { req, res, next };
}

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-upload-'));
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('upload middleware cleanup helpers', () => {
  test('removeUploadedFile ignores missing data and deletes real files best-effort', () => {
    expect(() => removeUploadedFile()).not.toThrow();
    expect(() => removeUploadedFile({})).not.toThrow();

    const filePath = makeFile('delete-me.txt', 'content');
    removeUploadedFile({ path: filePath });
    expect(fs.existsSync(filePath)).toBe(false);
    expect(() => removeUploadedFile({ path: filePath })).not.toThrow();
  });

  test('URL cleanup helpers ignore unsafe or missing upload URLs', () => {
    expect(() => removeUploadedResourceByUrl()).not.toThrow();
    expect(() => removeUploadedResourceByUrl('/uploads/submissions/wrong.txt')).not.toThrow();
    expect(() => removeUploadedResourceByUrl('/uploads/resources/../secret.txt')).not.toThrow();
    expect(() => removeUploadedSubmissionByUrl()).not.toThrow();
    expect(() => removeUploadedSubmissionByUrl('/uploads/resources/wrong.txt')).not.toThrow();
    expect(() => removeUploadedSubmissionByUrl('/uploads/submissions/../secret.txt')).not.toThrow();
  });
});

describe('image upload content validation', () => {
  test('accepts valid raster signatures and passes through empty file slots', () => {
    expect(runValidator(validateUploadedImage, null).next).toHaveBeenCalled();

    const jpg = makeFile('photo.jpg', Buffer.from([0xff, 0xd8, 1, 2, 3, 4, 5, 6, 7, 8, 0xff, 0xd9]));
    expect(runValidator(validateUploadedImage, {
      path: jpg,
      filename: 'photo.jpg'
    }).next).toHaveBeenCalled();

    const png = makeFile('image.png', Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from([0, 0, 0, 0])
    ]));
    expect(runValidator(validateUploadedImage, {
      path: png,
      filename: 'image.png'
    }).next).toHaveBeenCalled();

    const gif = makeFile('anim.gif', Buffer.from('GIF89aabcdef', 'ascii'));
    expect(runValidator(validateUploadedImage, {
      path: gif,
      filename: 'anim.gif'
    }).next).toHaveBeenCalled();

    const webp = makeFile('art.webp', Buffer.from('RIFFxxxxWEBP', 'ascii'));
    expect(runValidator(validateUploadedImage, {
      path: webp,
      filename: 'art.webp'
    }).next).toHaveBeenCalled();
  });

  test('rejects invalid, short, unknown, or unreadable image uploads', () => {
    const short = makeFile('short.png', Buffer.from([0x89, 0x50]));
    const shortResult = runValidator(validateUploadedImage, { path: short, filename: 'short.png' });
    expect(shortResult.res.statusCode).toBe(400);
    expect(shortResult.req.file).toBeNull();
    expect(fs.existsSync(short)).toBe(false);

    const unknown = makeFile('unknown.bmp', Buffer.from('not-an-image-signature'));
    expect(runValidator(validateUploadedImage, { path: unknown, filename: 'unknown.bmp' }).res.statusCode).toBe(400);

    const invalid = makeFile('fake.jpg', Buffer.from('not-a-real-jpeg-file'));
    expect(runValidator(validateUploadedImage, { path: invalid, filename: 'fake.jpg' }).res.body.error)
      .toMatch(/does not match/i);

    const unreadable = path.join(tempDir, 'missing.png');
    expect(runValidator(validateUploadedImage, { path: unreadable, filename: 'missing.png' }).res.body.error)
      .toMatch(/could not be validated/i);
  });
});

describe('resource upload content validation', () => {
  test('accepts supported resource signatures', () => {
    const cases = [
      ['lesson.pdf', Buffer.from('%PDF-1.4\n')],
      ['archive.zip', Buffer.from([0x50, 0x4b, 0x03, 0x04, 1])],
      ['legacy.doc', Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])],
      ['grades.csv', Buffer.from('name,grade\nAda,100\n')],
      ['notes.txt', Buffer.from('Plain notes\n')],
      ['notes.md', Buffer.from('# Notes\n')],
      ['page.html', Buffer.from('<!doctype html><p>ok</p>')],
      ['rich.rtf', Buffer.from('{\\rtf1 hello}')],
      ['image.png', Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.from([0, 0, 0, 0])
      ])],
      ['photo.jpg', Buffer.from([0xff, 0xd8, 1, 2, 3, 4, 5, 6, 7, 8, 0xff, 0xd9])]
    ];

    cases.forEach(([filename, contents]) => {
      const filePath = makeFile(filename, contents);
      expect(runValidator(validateUploadedResource, { path: filePath, filename }).next).toHaveBeenCalled();
    });
  });

  test('rejects invalid, binary text, empty, unknown, and unreadable resources', () => {
    expect(runValidator(validateUploadedResource, null).next).toHaveBeenCalled();

    const empty = makeFile('empty.pdf', Buffer.alloc(0));
    expect(runValidator(validateUploadedResource, { path: empty, filename: 'empty.pdf' }).res.statusCode).toBe(400);

    const fakePdf = makeFile('fake.pdf', Buffer.from('not pdf'));
    expect(runValidator(validateUploadedResource, { path: fakePdf, filename: 'fake.pdf' }).res.body.error)
      .toMatch(/does not match/i);

    const binaryText = makeFile('binary.txt', Buffer.from([65, 0, 66]));
    expect(runValidator(validateUploadedResource, { path: binaryText, filename: 'binary.txt' }).res.statusCode).toBe(400);

    const unknown = makeFile('unknown.bin', Buffer.from('data'));
    expect(runValidator(validateUploadedResource, { path: unknown, filename: 'unknown.bin' }).res.statusCode).toBe(400);

    const unreadable = path.join(tempDir, 'missing.pdf');
    expect(runValidator(validateUploadedResource, { path: unreadable, filename: 'missing.pdf' }).res.body.error)
      .toMatch(/could not be validated/i);
  });
});
