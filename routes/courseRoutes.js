const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const quizService = require('../services/quizService');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const contentRepository = require('../repositories/contentRepository');
const { requireAuth, requireRole, canAccessCourse, canManageCourse } = require('../middleware/auth');
const { resourceUpload, removeUploadedFile, validateUploadedResource } = require('../middleware/upload');
const { sendError } = require('../utils/appError');
const { parseOptionalPositiveInt, parseRequiredPositiveInt } = require('../utils/validation');

router.use(requireAuth);

function parseId(value) {
  try {
    return parseOptionalPositiveInt(value, 'id');
  } catch (err) {
    return null;
  }
}

function requireCourseAccess(req, res, next) {
  const courseId = parseId(req.params.courseId || req.params.id);
  if (!courseId) return res.status(400).json({ error: 'Invalid course ID.' });
  if (!canAccessCourse(req.user, courseId)) return res.status(403).json({ error: 'Course access required.' });
  req.courseId = courseId;
  next();
}

function requireCourseManager(req, res, next) {
  const courseId = parseId(req.params.courseId || req.params.id);
  if (!courseId) return res.status(400).json({ error: 'Invalid course ID.' });
  if (!canManageCourse(req.user, courseId)) return res.status(403).json({ error: 'Teacher or admin course access required.' });
  req.courseId = courseId;
  next();
}

function enrollmentCourseId(enrollmentId) {
  return enrollmentRepository.findCourseIdByEnrollmentId(enrollmentId);
}

function contentCourseId(table, id) {
  return contentRepository.findCourseId(table, id);
}

function uploadResourceFile(req, res, next) {
  resourceUpload.single('file')(req, res, err => {
    if (err) return sendError(res, err, 400);
    validateUploadedResource(req, res, next);
  });
}

function resourcePayload(req) {
  if (!req.file) return req.body;
  return {
    ...req.body,
    type: 'file',
    url: `/uploads/resources/${req.file.filename}`,
    fileName: req.file.originalname,
    fileSizeBytes: req.file.size,
    mimeType: req.file.mimetype
  };
}

function sendProtectedDownload(res, fileInfo) {
  const fileName = path.basename(fileInfo.storageUrl || '');
  const filePath = path.join(__dirname, '..', 'public', 'uploads', 'resources', fileName);
  const root = path.join(__dirname, '..', 'public', 'uploads', 'resources');
  if (!fileName || !filePath.startsWith(root) || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'");
  return res.download(filePath, fileInfo.fileName || fileName);
}

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List courses visible to the current user
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or code
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [private, published, archived]
 *         description: Filter by visibility
 *       - in: query
 *         name: lifecycle
 *         schema:
 *           type: string
 *           enum: [current, previous]
 *         description: Filter by effective course end date
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get('/', (req, res) => {
  try {
    res.json(courseService.getAll(req.user, {
      search: req.query.search,
      visibility: req.query.visibility,
      lifecycle: req.query.lifecycle
    }));
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Admin or Teacher)
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       201:
 *         description: Course created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    res.status(201).json(courseService.create(req.body, req.user));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/courses/enrollments/{id}:
 *   put:
 *     summary: Update an enrollment (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEnrollmentRequest'
 *     responses:
 *       200:
 *         description: Enrollment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Participant'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/enrollments/:id', (req, res) => {
  const enrollmentId = parseId(req.params.id);
  if (!enrollmentId) return res.status(400).json({ error: 'Invalid enrollment ID.' });
  const courseId = enrollmentCourseId(enrollmentId);
  if (!courseId) return res.status(404).json({ error: 'Enrollment not found.' });
  if (!canManageCourse(req.user, courseId)) return res.status(403).json({ error: 'Teacher or admin course access required.' });

  try {
    res.json(courseService.updateEnrollment(enrollmentId, req.body.status));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/courses/enrollments/{id}:
 *   delete:
 *     summary: Delete an enrollment (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Enrollment deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.delete('/enrollments/:id', (req, res) => {
  const enrollmentId = parseId(req.params.id);
  if (!enrollmentId) return res.status(400).json({ error: 'Invalid enrollment ID.' });
  const courseId = enrollmentCourseId(enrollmentId);
  if (!courseId) return res.status(404).json({ error: 'Enrollment not found.' });
  if (!canManageCourse(req.user, courseId)) return res.status(403).json({ error: 'Teacher or admin course access required.' });

  try {
    courseService.deleteEnrollment(enrollmentId);
    res.json({ message: 'Enrollment deleted successfully.' });
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/announcements/{id}:
 *   delete:
 *     summary: Delete an announcement (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Announcement deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.delete('/announcements/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid announcement ID.' });
  const courseId = contentCourseId('announcements', id);
  if (!courseId) return res.status(404).json({ error: 'Announcement not found.' });
  if (!canManageCourse(req.user, courseId)) return res.status(403).json({ error: 'Teacher or admin course access required.' });

  try {
    contentService.deleteAnnouncement(id);
    res.json({ message: 'Announcement deleted successfully.' });
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/resources/{id}:
 *   delete:
 *     summary: Delete a resource (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.delete('/resources/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid resource ID.' });
  const courseId = contentCourseId('resources', id);
  if (!courseId) return res.status(404).json({ error: 'Resource not found.' });
  if (!canManageCourse(req.user, courseId)) return res.status(403).json({ error: 'Teacher or admin course access required.' });

  try {
    contentService.deleteResource(id);
    res.json({ message: 'Resource deleted successfully.' });
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/resources/{id}/download:
 *   get:
 *     summary: Download a protected course resource file
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Protected file download
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/resources/:id/download', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid resource ID.' });
  try {
    const fileInfo = contentService.getResourceDownload(id, req.user);
    return sendProtectedDownload(res, fileInfo);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/participants:
 *   get:
 *     summary: Get course participants (Course Access)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of participants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Participant'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/:courseId/participants', requireCourseAccess, (req, res) => {
  try {
    res.json(courseService.getParticipants(req.courseId));
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/enrollments:
 *   post:
 *     summary: Enroll a user in the course (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEnrollmentRequest'
 *     responses:
 *       201:
 *         description: Enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Participant'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/:courseId/enrollments', requireCourseManager, (req, res) => {
  try {
    const userId = parseRequiredPositiveInt(req.body.userId, 'userId');
    res.status(201).json(courseService.enroll(req.courseId, userId, req.body.role));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/announcements:
 *   get:
 *     summary: Get course announcements (Course Access)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/:courseId/announcements', requireCourseAccess, (req, res) => {
  try {
    res.json(contentService.getAnnouncements(req.courseId));
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/announcements:
 *   post:
 *     summary: Create an announcement (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementRequest'
 *     responses:
 *       201:
 *         description: Announcement created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/:courseId/announcements', requireCourseManager, (req, res) => {
  try {
    res.status(201).json(contentService.createAnnouncement(req.courseId, req.body, req.user));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/resources:
 *   get:
 *     summary: Get course resources (Course Access)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/:courseId/resources', requireCourseAccess, (req, res) => {
  try {
    res.json(contentService.getResources(req.courseId));
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/resources:
 *   post:
 *     summary: Create a resource (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceRequest'
 *     responses:
 *       201:
 *         description: Resource created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/:courseId/resources', requireCourseManager, uploadResourceFile, (req, res) => {
  try {
    res.status(201).json(contentService.createResource(req.courseId, resourcePayload(req), req.user));
  } catch (err) {
    removeUploadedFile(req.file);
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/gradebook:
 *   get:
 *     summary: Get course gradebook (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course gradebook data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gradebook'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.get('/:courseId/gradebook', requireCourseManager, (req, res) => {
  try {
    res.json(quizService.getGradebook(req.courseId));
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course details (Course Access)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/:id', requireCourseAccess, (req, res) => {
  try {
    const course = courseService.getById(req.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json(course);
  } catch (err) {
    sendError(res, err, 500);
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourseRequest'
 *     responses:
 *       200:
 *         description: Course updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/:id', requireCourseManager, (req, res) => {
  try {
    res.json(courseService.update(req.courseId, req.body));
  } catch (err) {
    if (err.message === 'Course not found.') return res.status(404).json({ error: err.message });
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course (Course Manager)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.delete('/:id', requireCourseManager, (req, res) => {
  try {
    courseService.delete(req.courseId);
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    if (err.message === 'Course not found.') return res.status(404).json({ error: err.message });
    sendError(res, err, 500);
  }
});

module.exports = router;

