const express = require('express');
const router = express.Router();
const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const quizService = require('../services/quizService');
const { getDatabase } = require('../database/db');
const { requireAuth, requireRole, canAccessCourse, canManageCourse } = require('../middleware/auth');

router.use(requireAuth);

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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
  const db = getDatabase();
  const enrollment = db.prepare('SELECT courseId FROM enrollments WHERE id = ?').get(enrollmentId);
  return enrollment ? enrollment.courseId : null;
}

function contentCourseId(table, id) {
  const db = getDatabase();
  const row = db.prepare(`SELECT courseId FROM ${table} WHERE id = ?`).get(id);
  return row ? row.courseId : null;
}

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List courses visible to the current user
 *     tags: [Courses]
 */
router.get('/', (req, res) => {
  try {
    res.json(courseService.getAll(req.user, {
      search: req.query.search,
      visibility: req.query.visibility
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole(['admin', 'teacher']), (req, res) => {
  try {
    res.status(201).json(courseService.create(req.body, req.user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/enrollments/:id', (req, res) => {
  const enrollmentId = parseId(req.params.id);
  if (!enrollmentId) return res.status(400).json({ error: 'Invalid enrollment ID.' });
  const courseId = enrollmentCourseId(enrollmentId);
  if (!courseId) return res.status(404).json({ error: 'Enrollment not found.' });
  if (!canManageCourse(req.user, courseId)) return res.status(403).json({ error: 'Teacher or admin course access required.' });

  try {
    res.json(courseService.updateEnrollment(enrollmentId, req.body.status));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});

router.get('/:courseId/participants', requireCourseAccess, (req, res) => {
  try {
    res.json(courseService.getParticipants(req.courseId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:courseId/enrollments', requireCourseManager, (req, res) => {
  try {
    res.status(201).json(courseService.enroll(req.courseId, Number(req.body.userId), req.body.role));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:courseId/announcements', requireCourseAccess, (req, res) => {
  try {
    res.json(contentService.getAnnouncements(req.courseId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:courseId/announcements', requireCourseManager, (req, res) => {
  try {
    res.status(201).json(contentService.createAnnouncement(req.courseId, req.body, req.user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:courseId/resources', requireCourseAccess, (req, res) => {
  try {
    res.json(contentService.getResources(req.courseId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:courseId/resources', requireCourseManager, (req, res) => {
  try {
    res.status(201).json(contentService.createResource(req.courseId, req.body, req.user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:courseId/gradebook', requireCourseManager, (req, res) => {
  try {
    res.json(quizService.getGradebook(req.courseId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireCourseAccess, (req, res) => {
  try {
    const course = courseService.getById(req.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireCourseManager, (req, res) => {
  try {
    res.json(courseService.update(req.courseId, req.body));
  } catch (err) {
    if (err.message === 'Course not found.') return res.status(404).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireCourseManager, (req, res) => {
  try {
    courseService.delete(req.courseId);
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    if (err.message === 'Course not found.') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
