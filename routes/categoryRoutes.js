const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');
const { validateId, requireFields, sanitizeStrings } = require('../middleware/validation');
const { requireAuth, requireRole, canAccessCourse, canManageCourse } = require('../middleware/auth');
const { parseOptionalPositiveInt, parseRequiredPositiveInt } = require('../utils/validation');

router.use(requireAuth);

function ensureCategoryAccess(req, res, category) {
  if (!category) {
    res.status(404).json({ error: 'Category not found.' });
    return false;
  }
  try {
    if (req.user.role === 'student' && category.courseId && !canAccessCourse(req.user, category.courseId)) {
      res.status(403).json({ error: 'Course access required.' });
      return false;
    }
    if (req.user.role !== 'student') categoryService.assertCanRead(category, req.user);
    return true;
  } catch (err) {
    res.status(err.status || 403).json({ error: err.message });
    return false;
  }
}

function ensureCategoryManager(req, res, category) {
  if (!category) {
    res.status(404).json({ error: 'Category not found.' });
    return false;
  }
  try {
    categoryService.assertCanWrite(category, req.user);
    return true;
  } catch (err) {
    res.status(err.status || 403).json({ error: err.message });
    return false;
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Category name (unique)
 *         description:
 *           type: string
 *           description: Category description
 *         questionCount:
 *           type: integer
 *           description: Number of questions in this category
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         name: JavaScript
 *         description: Questions about JavaScript fundamentals
 *         questionCount: 5
 *         createdAt: "2026-05-01T12:00:00"
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', (req, res) => {
  try {
    const categories = categoryService.getAll({
      courseId: parseOptionalPositiveInt(req.query.courseId, 'courseId') || undefined,
      user: req.user
    });
    res.json(categories);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: The category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.get('/:id', validateId, (req, res) => {
  try {
    const category = categoryService.getById(req.params.id);
    if (!ensureCategoryAccess(req, res, category)) return;
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/', requireRole(['admin', 'teacher']), requireFields(['name']), sanitizeStrings(['name', 'description']), (req, res) => {
  try {
    const courseId = parseOptionalPositiveInt(req.body.courseId, 'courseId');
    if (req.user.role === 'teacher' && !courseId) {
      return res.status(403).json({ error: 'Teacher course category required.' });
    }
    if (req.user.role === 'teacher' && !canManageCourse(req.user, courseId)) {
      return res.status(403).json({ error: 'Teacher course access required.' });
    }
    req.body.courseId = courseId;
    const category = categoryService.create(req.body, req.user);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/400BadRequest'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.put('/:id', validateId, sanitizeStrings(['name', 'description']), (req, res) => {
  try {
    const existing = categoryService.getById(req.params.id);
    if (!ensureCategoryManager(req, res, existing)) return;
    if (req.body.courseId !== undefined) {
      req.body.courseId = parseOptionalPositiveInt(req.body.courseId, 'courseId');
      if (req.body.courseId && !canManageCourse(req.user, req.body.courseId)) {
        return res.status(403).json({ error: 'Teacher or admin course access required.' });
      }
    }
    const category = categoryService.update(req.params.id, req.body, req.user);
    res.json(category);
  } catch (err) {
    if (err.message === 'Category not found.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(err.status || 400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 *       404:
 *         $ref: '#/components/responses/404NotFound'
 */
router.delete('/:id', validateId, (req, res) => {
  try {
    const existing = categoryService.getById(req.params.id);
    if (!ensureCategoryManager(req, res, existing)) return;
    categoryService.delete(req.params.id, req.user);
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    if (err.message === 'Category not found.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}/share:
 *   post:
 *     summary: Share a category with another teacher
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/ResourceAccessGrantRequest'
 *     responses:
 *       201:
 *         description: Category access grant created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceAccessGrant'
 *       403:
 *         $ref: '#/components/responses/403Forbidden'
 */
router.post('/:id/share', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    res.status(201).json(categoryService.share(req.params.id, req.body, req.user));
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message, field: err.field });
  }
});

/**
 * @swagger
 * /api/categories/{id}/access:
 *   get:
 *     summary: View category sharing access
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category access summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceAccessSummary'
 */
router.get('/:id/access', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    res.json(categoryService.accessSummary(req.params.id, req.user));
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message, field: err.field });
  }
});

/**
 * @swagger
 * /api/categories/{id}/access/{teacherId}:
 *   delete:
 *     summary: Remove a teacher's shared category access
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated category access summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceAccessSummary'
 */
router.delete('/:id/access/:teacherId', requireRole(['admin', 'teacher']), validateId, (req, res) => {
  try {
    const teacherId = parseRequiredPositiveInt(req.params.teacherId, 'teacherId');
    res.json(categoryService.removeAccess(req.params.id, teacherId, req.user));
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message, field: err.field });
  }
});

module.exports = router;
