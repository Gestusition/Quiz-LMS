const express = require('express');
const router = express.Router();
const courseWeekService = require('../services/courseWeekService');
const auditService = require('../services/auditService');
const { requireAuth } = require('../middleware/auth');
const { sendError } = require('../utils/appError');

router.use(requireAuth);

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

router.put('/weeks/:id', (req, res) => {
  try {
    const weekId = Number(req.params.id);
    res.json(courseWeekService.updateWeek(weekId, req.user, req.body));
  } catch (err) {
    sendError(res, err, 400);
  }
});

router.delete('/weeks/:id', (req, res) => {
  try {
    const weekId = Number(req.params.id);
    courseWeekService.deleteWeek(weekId, req.user);
    res.json({ message: 'Week deleted successfully.' });
  } catch (err) {
    sendError(res, err, 400);
  }
});

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

router.post('/weeks/:id/resources', (req, res) => {
  try {
    const weekId = Number(req.params.id);
    const resource = courseWeekService.createWeekResource(weekId, req.user, req.body);
    res.status(201).json(resource);
  } catch (err) {
    sendError(res, err, 400);
  }
});

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
