const express = require('express');
const router = express.Router();
const academicService = require('../services/academicService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { removeUploadedFile, submissionUpload } = require('../middleware/upload');

router.use(requireAuth);

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function sendError(res, err) {
  if (err.status === 403) return res.status(403).json({ error: err.message });
  if (/not found/i.test(err.message)) return res.status(404).json({ error: err.message });
  return res.status(400).json({ error: err.message });
}

function requireValidId(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid ID.' });
  req.params.id = id;
  next();
}

function handleSubmissionUpload(req, res, next) {
  submissionUpload.single('file')(req, res, err => {
    if (!err) return next();
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: err.message });
  });
}

/**
 * @swagger
 * /api/academic/faculties:
 *   get:
 *     summary: List faculties
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Faculties
 *   post:
 *     summary: Create a faculty (Admin only)
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Faculty created
 */
router.get('/faculties', (req, res) => {
  try { res.json(academicService.listFaculties()); } catch (err) { sendError(res, err); }
});
router.post('/faculties', requireRole('admin'), (req, res) => {
  try { res.status(201).json(academicService.createFaculty(req.body)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/faculties/{id}:
 *   put:
 *     summary: Update a faculty (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Faculty updated
 *   delete:
 *     summary: Delete a faculty (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Faculty deleted
 */
router.put('/faculties/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.updateFaculty(req.params.id, req.body)); } catch (err) { sendError(res, err); }
});
router.delete('/faculties/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { academicService.deleteFaculty(req.params.id); res.json({ message: 'Faculty deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/departments:
 *   get:
 *     summary: List departments
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Departments
 *   post:
 *     summary: Create a department (Admin only)
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Department created
 */
router.get('/departments', (req, res) => {
  try { res.json(academicService.listDepartments(req.query)); } catch (err) { sendError(res, err); }
});
router.post('/departments', requireRole('admin'), (req, res) => {
  try { res.status(201).json(academicService.createDepartment(req.body)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/departments/{id}:
 *   put:
 *     summary: Update a department (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department updated
 *   delete:
 *     summary: Delete a department (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department deleted
 */
router.put('/departments/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.updateDepartment(req.params.id, req.body)); } catch (err) { sendError(res, err); }
});
router.delete('/departments/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { academicService.deleteDepartment(req.params.id); res.json({ message: 'Department deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/class-years:
 *   get:
 *     summary: List class years
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Class years
 *   post:
 *     summary: Create a class year (Admin only)
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Class year created
 */
router.get('/class-years', (req, res) => {
  try { res.json(academicService.listClassYears(req.query)); } catch (err) { sendError(res, err); }
});
router.post('/class-years', requireRole('admin'), (req, res) => {
  try { res.status(201).json(academicService.createClassYear(req.body)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/class-years/{id}:
 *   put:
 *     summary: Update a class year (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Class year updated
 *   delete:
 *     summary: Delete a class year (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Class year deleted
 */
router.put('/class-years/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.updateClassYear(req.params.id, req.body)); } catch (err) { sendError(res, err); }
});
router.delete('/class-years/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { academicService.deleteClassYear(req.params.id); res.json({ message: 'Class year deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/sections:
 *   get:
 *     summary: List sections
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Sections
 *   post:
 *     summary: Create a section (Admin only)
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Section created
 */
router.get('/sections', (req, res) => {
  try { res.json(academicService.listSections(req.query)); } catch (err) { sendError(res, err); }
});
router.post('/sections', requireRole('admin'), (req, res) => {
  try { res.status(201).json(academicService.createSection(req.body)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/sections/{id}:
 *   put:
 *     summary: Update a section (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Section updated
 *   delete:
 *     summary: Delete a section (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Section deleted
 */
router.put('/sections/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.updateSection(req.params.id, req.body)); } catch (err) { sendError(res, err); }
});
router.delete('/sections/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { academicService.deleteSection(req.params.id); res.json({ message: 'Section deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/terms:
 *   get:
 *     summary: List academic terms
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Terms
 *   post:
 *     summary: Create an academic term (Admin only)
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Term created
 */
router.get('/terms', (req, res) => {
  try { res.json(academicService.listTerms()); } catch (err) { sendError(res, err); }
});
router.post('/terms', requireRole('admin'), (req, res) => {
  try { res.status(201).json(academicService.createTerm(req.body)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/terms/{id}/active:
 *   post:
 *     summary: Mark a term active (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Active term updated
 */
router.post('/terms/:id/active', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.setActiveTerm(req.params.id)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/terms/{id}:
 *   put:
 *     summary: Update an academic term (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Term updated
 *   delete:
 *     summary: Delete an academic term (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Term deleted
 */
router.put('/terms/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.updateTerm(req.params.id, req.body)); } catch (err) { sendError(res, err); }
});
router.delete('/terms/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { academicService.deleteTerm(req.params.id); res.json({ message: 'Term deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/offerings:
 *   get:
 *     summary: List course offerings visible to the current user
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Course offerings
 *   post:
 *     summary: Create a course offering (Admin only)
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Course offering created
 */
router.get('/offerings', (req, res) => {
  try { res.json(academicService.listCourseOfferings(req.user, req.query)); } catch (err) { sendError(res, err); }
});
router.post('/offerings', requireRole('admin'), (req, res) => {
  try { res.status(201).json(academicService.createCourseOffering(req.body)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/offerings/{id}/enrollments:
 *   get:
 *     summary: List enrollments for a course offering
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Offering enrollments
 */
router.get('/offerings/:id/enrollments', requireValidId, (req, res) => {
  try { res.json(academicService.listOfferingEnrollments(req.params.id, req.user)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/offerings/{id}:
 *   get:
 *     summary: Get a course offering
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course offering
 *   put:
 *     summary: Update a course offering (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course offering updated
 *   delete:
 *     summary: Delete a course offering (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course offering deleted
 */
router.get('/offerings/:id', requireValidId, (req, res) => {
  try { res.json(academicService.getCourseOffering(req.params.id, req.user)); } catch (err) { sendError(res, err); }
});
router.put('/offerings/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.updateCourseOffering(req.params.id, req.body)); } catch (err) { sendError(res, err); }
});
router.delete('/offerings/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { academicService.deleteCourseOffering(req.params.id); res.json({ message: 'Course offering deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/enrollments:
 *   post:
 *     summary: Enroll a student in a course offering (Admin only)
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Enrollment created
 */
router.post('/enrollments', requireRole('admin'), (req, res) => {
  try { res.status(201).json(academicService.enrollInOffering(req.body)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/enrollments/{id}:
 *   put:
 *     summary: Update a course-offering enrollment (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Enrollment updated
 *   delete:
 *     summary: Delete a course-offering enrollment (Admin only)
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Enrollment deleted
 */
router.put('/enrollments/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { res.json(academicService.updateOfferingEnrollment(req.params.id, req.body)); } catch (err) { sendError(res, err); }
});
router.delete('/enrollments/:id', requireRole('admin'), requireValidId, (req, res) => {
  try { academicService.deleteOfferingEnrollment(req.params.id); res.json({ message: 'Enrollment deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/assignments:
 *   get:
 *     summary: List assignments visible to the current user
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Assignments
 *   post:
 *     summary: Create an assignment for a course offering
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Assignment created
 */
router.get('/assignments', (req, res) => {
  try { res.json(academicService.listAssignments(req.user, req.query)); } catch (err) { sendError(res, err); }
});
router.post('/assignments', requireRole(['admin', 'teacher']), (req, res) => {
  try { res.status(201).json(academicService.createAssignment(req.body, req.user)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/assignments/{id}/submissions:
 *   get:
 *     summary: List assignment submissions for instructors or admins
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Submissions
 *   post:
 *     summary: Submit assignment work as a student
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Submission saved
 */
router.get('/assignments/:id/submissions', requireValidId, (req, res) => {
  try { res.json(academicService.listSubmissions(req.params.id, req.user)); } catch (err) { sendError(res, err); }
});
router.post('/assignments/:id/submissions', requireValidId, handleSubmissionUpload, (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.submissionUrl = `/uploads/submissions/${req.file.filename}`;
    payload.fileName = req.file.originalname;
    payload.fileSizeBytes = req.file.size;
    payload.mimeType = req.file.mimetype;
  }
  try {
    res.status(201).json(academicService.submitAssignment(req.params.id, payload, req.user));
  } catch (err) {
    removeUploadedFile(req.file);
    sendError(res, err);
  }
});

/**
 * @swagger
 * /api/academic/assignments/{id}:
 *   get:
 *     summary: Get an assignment
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment
 *   put:
 *     summary: Update an assignment
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment updated
 *   delete:
 *     summary: Delete an assignment
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment deleted
 */
router.get('/assignments/:id', requireValidId, (req, res) => {
  try { res.json(academicService.getAssignment(req.params.id, req.user)); } catch (err) { sendError(res, err); }
});
router.put('/assignments/:id', requireRole(['admin', 'teacher']), requireValidId, (req, res) => {
  try { res.json(academicService.updateAssignment(req.params.id, req.body, req.user)); } catch (err) { sendError(res, err); }
});
router.delete('/assignments/:id', requireRole(['admin', 'teacher']), requireValidId, (req, res) => {
  try { academicService.deleteAssignment(req.params.id, req.user); res.json({ message: 'Assignment deleted successfully.' }); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/submissions/{id}/grade:
 *   put:
 *     summary: Grade or return an assignment submission
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Submission graded
 */
router.put('/submissions/:id/grade', requireRole(['admin', 'teacher']), requireValidId, (req, res) => {
  try { res.json(academicService.gradeSubmission(req.params.id, req.body, req.user)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/attendance/sessions:
 *   get:
 *     summary: List attendance sessions visible to the current user
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Attendance sessions
 *   post:
 *     summary: Create an attendance session
 *     tags: [Academic]
 *     responses:
 *       201:
 *         description: Attendance session created
 */
router.get('/attendance/sessions', (req, res) => {
  try { res.json(academicService.listAttendanceSessions(req.user, req.query)); } catch (err) { sendError(res, err); }
});
router.post('/attendance/sessions', requireRole(['admin', 'teacher']), (req, res) => {
  try { res.status(201).json(academicService.createAttendanceSession(req.body, req.user)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/attendance/sessions/{id}/records:
 *   post:
 *     summary: Mark attendance records for a session
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attendance records saved
 */
router.post('/attendance/sessions/:id/records', requireRole(['admin', 'teacher']), requireValidId, (req, res) => {
  try { res.json(academicService.markAttendance(req.params.id, req.body.records, req.user)); } catch (err) { sendError(res, err); }
});

router.get('/attendance/records', requireRole(['admin', 'teacher']), (req, res) => {
  try { res.json(academicService.listAttendanceRecordDetails(req.user, req.query)); } catch (err) { sendError(res, err); }
});

router.get('/attendance/sessions/:id/records', requireRole(['admin', 'teacher']), requireValidId, (req, res) => {
  try { res.json(academicService.listAttendanceRecords(req.params.id, req.user)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/attendance/my:
 *   get:
 *     summary: View current student's attendance records
 *     tags: [Academic]
 *     responses:
 *       200:
 *         description: Student attendance records
 */
router.get('/attendance/my', requireRole('student'), (req, res) => {
  try { res.json(academicService.getAttendanceForStudent(req.user)); } catch (err) { sendError(res, err); }
});

/**
 * @swagger
 * /api/academic/attendance/offerings/{id}/summary:
 *   get:
 *     summary: View attendance summary for a course offering
 *     tags: [Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attendance summary
 */
router.get('/attendance/offerings/:id/summary', requireRole(['admin', 'teacher']), requireValidId, (req, res) => {
  try { res.json(academicService.attendanceSummary(req.params.id, req.user)); } catch (err) { sendError(res, err); }
});

module.exports = router;
