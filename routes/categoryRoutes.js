const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');
const { validateId, requireFields, sanitizeStrings } = require('../middleware/validation');

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
    const categories = categoryService.getAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }
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
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 */
router.post('/', requireFields(['name']), sanitizeStrings(['name', 'description']), (req, res) => {
  try {
    const category = categoryService.create(req.body);
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 */
router.put('/:id', validateId, sanitizeStrings(['name', 'description']), (req, res) => {
  try {
    const category = categoryService.update(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    if (err.message === 'Category not found.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
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
 *       404:
 *         description: Category not found
 */
router.delete('/:id', validateId, (req, res) => {
  try {
    categoryService.delete(req.params.id);
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    if (err.message === 'Category not found.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
