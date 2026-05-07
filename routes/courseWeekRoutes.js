const express = require('express');
const router = express.Router();
const courseWeekService = require('../services/courseWeekService');
const auditService = require('../services/auditService');
const { requireAuth } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);

/**
 * @swagger
 * /api/weeks/courses/{courseId}/weeks:
 *   get:
 *     summary: List weekly course material
 *     tags: [Weeks]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated course weeks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseWeek'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/courses/:courseId/weeks', (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    res.json(courseWeekService.listWeeks(courseId, req.user, {
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/weeks/courses/{courseId}/weeks:
 *   post:
 *     summary: Create a course week
 *     tags: [Weeks]
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
 *             $ref: '#/components/schemas/CreateCourseWeekRequest'
 *     responses:
 *       201:
 *         description: Created course week
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseWeek'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.post('/courses/:courseId/weeks', (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const week = courseWeekService.createWeek(courseId, req.user, req.body);
    auditService.log({
      actorUserId: req.user.id,
      action: 'COURSE_WEEK_CREATED',
      entityType: 'course_week',
      entityId: week.id,
      details: { courseId }
    });
    res.status(201).json(week);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/weeks/weeks/{id}:
 *   put:
 *     summary: Update a course week
 *     tags: [Weeks]
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
 *             $ref: '#/components/schemas/UpdateCourseWeekRequest'
 *     responses:
 *       200:
 *         description: Updated course week
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseWeek'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/weeks/:id', (req, res) => {
  try {
    const weekId = Number(req.params.id);
    res.json(courseWeekService.updateWeek(weekId, req.user, req.body));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/weeks/weeks/{id}:
 *   delete:
 *     summary: Delete a course week
 *     tags: [Weeks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course week deleted
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
router.delete('/weeks/:id', (req, res) => {
  try {
    const weekId = Number(req.params.id);
    courseWeekService.deleteWeek(weekId, req.user);
    res.json({ message: 'Week deleted successfully.' });
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/weeks/weeks/{id}/resources:
 *   get:
 *     summary: List resources for a course week
 *     tags: [Weeks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated week resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WeekResource'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.get('/weeks/:id/resources', (req, res) => {
  try {
    const weekId = Number(req.params.id);
    res.json(courseWeekService.listWeekResources(weekId, req.user, {
      page: req.query.page,
      limit: req.query.limit
    }));
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/weeks/weeks/{id}/resources:
 *   post:
 *     summary: Create a resource for a course week
 *     tags: [Weeks]
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
 *             $ref: '#/components/schemas/CreateWeekResourceRequest'
 *     responses:
 *       201:
 *         description: Created week resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeekResource'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.post('/weeks/:id/resources', (req, res) => {
  try {
    const weekId = Number(req.params.id);
    const resource = courseWeekService.createWeekResource(weekId, req.user, req.body);
    res.status(201).json(resource);
  } catch (err) {
    sendError(res, err, 400);
  }
});

/**
 * @swagger
 * /api/weeks/week-resources/{id}:
 *   delete:
 *     summary: Delete a week resource
 *     tags: [Weeks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Week resource deleted
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
router.delete('/week-resources/:id', (req, res) => {
  try {
    const resourceId = Number(req.params.id);
    courseWeekService.deleteWeekResource(resourceId, req.user);
    res.json({ message: 'Week resource deleted successfully.' });
  } catch (err) {
    sendError(res, err, 400);
  }
});

module.exports = router;
