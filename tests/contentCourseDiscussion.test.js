const path = require('path');
const fs = require('fs');
const {
  initDatabase,
  seedDatabase,
  closeDatabase,
  resolveDatabaseFiles
} = require('../database/db');
const authService = require('../services/authService');
const settingsService = require('../services/settingsService');
const courseService = require('../services/courseService');
const contentService = require('../services/contentService');
const courseWeekService = require('../services/courseWeekService');
const discussionService = require('../services/discussionService');
const restrictionService = require('../services/restrictionService');

const TEST_DB = path.join(__dirname, 'test_content_course_discussion.db');

function removeDbFiles() {
  const files = Object.values(resolveDatabaseFiles(TEST_DB));
  files.forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function userStamp() {
  return String(Date.now()).slice(-8);
}

let ctx;

beforeAll(() => {
  removeDbFiles();
  initDatabase(TEST_DB);
  seedDatabase();
  settingsService.setMaintenanceMode(false);

  const stamp = userStamp();
  const admin = authService.createUser({
    name: `Service Admin ${stamp}`,
    username: `service-admin-${stamp}`,
    email: `service-admin-${stamp}@example.com`,
    role: 'admin',
    password: 'ServiceAdmin123!'
  });
  const teacher = authService.createUser({
    name: `Service Teacher ${stamp}`,
    username: `service-teacher-${stamp}`,
    email: `service-teacher-${stamp}@example.com`,
    role: 'teacher',
    password: 'ServiceTeacher123!',
    staffNumber: `SVC-T-${stamp}`
  });
  const otherTeacher = authService.createUser({
    name: `Service Other Teacher ${stamp}`,
    username: `service-other-teacher-${stamp}`,
    email: `service-other-teacher-${stamp}@example.com`,
    role: 'teacher',
    password: 'ServiceTeacher123!',
    staffNumber: `SVC-OT-${stamp}`
  });
  const student = authService.createUser({
    name: `Service Student ${stamp}`,
    username: `service-student-${stamp}`,
    email: `service-student-${stamp}@example.com`,
    role: 'student',
    password: 'ServiceStudent123!',
    studentNumber: `SVC-S-${stamp}`
  });
  const outsider = authService.createUser({
    name: `Service Outsider ${stamp}`,
    username: `service-outsider-${stamp}`,
    email: `service-outsider-${stamp}@example.com`,
    role: 'student',
    password: 'ServiceStudent123!',
    studentNumber: `SVC-O-${stamp}`
  });

  const course = courseService.create({
    code: `SVC-${stamp}`,
    title: `Service Coverage ${stamp}`,
    description: 'Direct service workflow coverage.',
    credits: 4,
    visibility: 'published'
  }, teacher);
  const studentEnrollment = courseService.enroll(course.id, student.id, 'student');

  ctx = { admin, teacher, otherTeacher, student, outsider, course, studentEnrollment };
});

afterAll(() => {
  closeDatabase();
  removeDbFiles();
});

describe('course service workflows', () => {
  test('creates courses, manages enrollments, and validates role/status rules', () => {
    const { course, teacher, student, otherTeacher, studentEnrollment } = ctx;

    expect(course.code).toMatch(/^SVC-/);
    expect(courseService.getById(course.id).title).toBe(course.title);
    expect(courseService.getAll(teacher).some(item => item.id === course.id)).toBe(true);
    expect(courseService.getParticipants(course.id).some(item => item.id === teacher.id && item.courseRole === 'teacher')).toBe(true);
    expect(courseService.getParticipants(course.id).some(item => item.id === student.id && item.courseRole === 'student')).toBe(true);

    const suspended = courseService.updateEnrollment(studentEnrollment.enrollmentId, 'suspended');
    expect(suspended.enrollmentStatus).toBe('suspended');

    const reactivated = courseService.enroll(course.id, student.id, 'student');
    expect(reactivated.enrollmentId).toBe(studentEnrollment.enrollmentId);
    expect(reactivated.enrollmentStatus).toBe('active');

    const teacherEnrollment = courseService.enroll(course.id, otherTeacher.id, 'teacher');
    expect(teacherEnrollment.courseRole).toBe('teacher');
    expect(courseService.deleteEnrollment(teacherEnrollment.enrollmentId)).toBe(true);

    expect(() => courseService.enroll(course.id, student.id, 'assistant')).toThrow(/teacher or student/i);
    expect(() => courseService.enroll(course.id, student.id, 'teacher')).toThrow(/teacher accounts/i);
    expect(() => courseService.enroll(course.id, otherTeacher.id, 'student')).toThrow(/student accounts/i);
    expect(() => courseService.enroll(999999, student.id, 'student')).toThrow(/course not found/i);
    expect(() => courseService.updateEnrollment(studentEnrollment.enrollmentId, 'paused')).toThrow(/active or suspended/i);
    expect(() => courseService.updateEnrollment(999999, 'active')).toThrow(/enrollment not found/i);
    expect(() => courseService.deleteEnrollment(999999)).toThrow(/enrollment not found/i);

    const updated = courseService.update(course.id, { title: `${course.title} Updated`, credits: 5 });
    expect(updated.title).toMatch(/Updated/);
    expect(updated.credits).toBe(5);
    expect(() => courseService.update(999999, { title: 'Missing' })).toThrow(/course not found/i);
  });
});

describe('content and weekly resource workflows', () => {
  test('validates announcements, resources, visibility, and protected downloads', () => {
    const { course, teacher, student, outsider } = ctx;

    const announcement = contentService.createAnnouncement(course.id, {
      title: 'Welcome',
      body: 'Read the week one material.'
    }, teacher);
    expect(announcement.title).toBe('Welcome');
    expect(contentService.getAnnouncements(course.id).map(item => item.id)).toContain(announcement.id);
    expect(contentService.deleteAnnouncement(announcement.id)).toBe(true);
    expect(() => contentService.deleteAnnouncement(announcement.id)).toThrow(/announcement not found/i);
    expect(() => contentService.createAnnouncement(999999, { title: 'No', body: 'Course' }, teacher)).toThrow(/course not found/i);
    expect(() => contentService.createAnnouncement(course.id, { title: 'x', body: 'ok' }, teacher)).toThrow(/title/i);

    const linkResource = contentService.createResource(course.id, {
      title: 'Reference',
      type: 'link',
      url: 'https://example.com/reference',
      description: 'External reading'
    }, teacher);
    expect(linkResource.type).toBe('link');
    expect(linkResource.downloadUrl).toBeUndefined();

    const fileResource = contentService.createResource(course.id, {
      title: 'Slides',
      type: 'file',
      url: '/uploads/resources/slides.pdf',
      fileName: 'slides.pdf',
      fileSizeBytes: 42,
      mimeType: 'application/pdf'
    }, teacher);
    expect(fileResource.downloadUrl).toBe(`/api/courses/resources/${fileResource.id}/download`);
    expect(contentService.getResourceDownload(fileResource.id, student).fileName).toBe('slides.pdf');
    expect(() => contentService.getResourceDownload(fileResource.id, outsider)).toThrow(/course access/i);
    expect(() => contentService.getResourceDownload(linkResource.id, student)).toThrow(/resource not found/i);
    expect(() => contentService.createResource(course.id, { title: 'Bad', type: 'link' }, teacher)).toThrow(/url/i);
    expect(() => contentService.createResource(course.id, {
      title: 'Huge',
      type: 'file',
      url: '/uploads/resources/huge.pdf',
      fileSizeBytes: 101 * 1024 * 1024
    }, teacher)).toThrow(/100 MB/i);
    expect(contentService.deleteResource(fileResource.id)).toBe(true);
    expect(() => contentService.deleteResource(fileResource.id)).toThrow(/resource not found/i);

    const visibleWeek = courseWeekService.createWeek(course.id, teacher, {
      weekNumber: 1,
      title: 'Week One',
      description: 'Visible week',
      visible: true,
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-01-07T00:00:00.000Z'
    });
    const hiddenWeek = courseWeekService.createWeek(course.id, teacher, {
      weekNumber: 2,
      title: 'Hidden Week',
      visible: false
    });
    const visibleWeeks = courseWeekService.listWeeks(course.id, student).items.map(item => item.id);
    expect(visibleWeeks).toContain(visibleWeek.id);
    expect(visibleWeeks).not.toContain(hiddenWeek.id);

    const updatedWeek = courseWeekService.updateWeek(visibleWeek.id, teacher, {
      title: 'Week One Updated',
      visible: true
    });
    expect(updatedWeek.title).toBe('Week One Updated');
    expect(() => courseWeekService.updateWeek(999999, teacher, { title: 'Missing' })).toThrow(/course week not found/i);
    expect(() => courseWeekService.createWeek(course.id, student, { weekNumber: 3, title: 'No' })).toThrow(/course access/i);
    expect(() => courseWeekService.createWeek(course.id, teacher, {
      weekNumber: 3,
      title: 'Bad Dates',
      startsAt: '2026-02-01T00:00:00.000Z',
      endsAt: '2026-01-01T00:00:00.000Z'
    })).toThrow(/starts_at/i);

    const weekLink = courseWeekService.createWeekResource(visibleWeek.id, teacher, {
      title: 'Week Link',
      type: 'link',
      content: 'https://example.com/week'
    });
    const weekFile = courseWeekService.createWeekResource(visibleWeek.id, teacher, {
      title: 'Week File',
      type: 'file',
      content: '/uploads/resources/week.pdf',
      fileName: 'week.pdf',
      fileSizeBytes: 64,
      mimeType: 'application/pdf'
    });
    const futureResource = courseWeekService.createWeekResource(visibleWeek.id, teacher, {
      title: 'Future File',
      type: 'file',
      content: '/uploads/resources/future.pdf',
      fileName: 'future.pdf',
      visibleFrom: '2099-01-01T00:00:00.000Z'
    });

    const studentResources = courseWeekService.listWeekResources(visibleWeek.id, student);
    expect(studentResources.items.map(item => item.id)).toContain(weekLink.id);
    expect(studentResources.items.map(item => item.id)).toContain(weekFile.id);
    expect(studentResources.items.map(item => item.id)).not.toContain(futureResource.id);
    expect(studentResources.items.find(item => item.id === weekFile.id).downloadUrl).toBe(`/api/weeks/week-resources/${weekFile.id}/download`);
    expect(courseWeekService.getWeekResourceDownload(weekFile.id, student).fileName).toBe('week.pdf');
    expect(() => courseWeekService.getWeekResourceDownload(futureResource.id, student)).toThrow(/not visible/i);
    expect(() => courseWeekService.createWeekResource(visibleWeek.id, teacher, { title: 'No URL', type: 'link' })).toThrow(/URL is required/i);
    expect(() => courseWeekService.createWeekResource(visibleWeek.id, teacher, {
      title: 'Huge Week File',
      type: 'file',
      content: '/uploads/resources/huge-week.pdf',
      fileSizeBytes: 101 * 1024 * 1024
    })).toThrow(/100 MB/i);
    expect(() => courseWeekService.listWeekResources(999999, student)).toThrow(/course week not found/i);
    expect(courseWeekService.deleteWeekResource(weekFile.id, teacher)).toBe(true);
    expect(() => courseWeekService.deleteWeekResource(weekFile.id, teacher)).toThrow(/week resource not found/i);
    expect(courseWeekService.deleteWeek(hiddenWeek.id, teacher)).toBe(true);
    expect(() => courseWeekService.deleteWeek(hiddenWeek.id, teacher)).toThrow(/course week not found/i);
  });
});

describe('discussion service workflows', () => {
  test('enforces course access, lock state, and chat restrictions', () => {
    const { course, teacher, student, outsider } = ctx;

    expect(discussionService.listThreads(course.id, student).items).toEqual([]);

    const thread = discussionService.createThread(course.id, student, {
      title: 'Question about week one',
      body: 'Can we review the practice quiz?'
    });
    expect(thread.status).toBe('open');
    expect(discussionService.getThread(thread.id, teacher).id).toBe(thread.id);

    const reply = discussionService.createReply(thread.id, teacher, {
      body: 'Yes, we will review it during class.'
    });
    expect(reply.body).toMatch(/review/);
    expect(discussionService.listReplies(thread.id, student).items.map(item => item.id)).toContain(reply.id);

    expect(() => discussionService.createThread(course.id, outsider, {
      title: 'No access',
      body: 'This should fail.'
    })).toThrow(/course access/i);
    expect(() => discussionService.updateThreadStatus(thread.id, student, 'locked')).toThrow(/instructors/i);
    expect(() => discussionService.updateThreadStatus(thread.id, teacher, 'bad')).toThrow(/status/i);

    const locked = discussionService.updateThreadStatus(thread.id, teacher, 'locked');
    expect(locked.status).toBe('locked');
    expect(() => discussionService.createReply(thread.id, student, { body: 'Locked?' })).toThrow(/locked/i);

    restrictionService.create({
      userId: student.id,
      restrictionType: 'chat_muted',
      scopeType: 'course',
      scopeId: course.id,
      reason: 'Temporary hold'
    }, teacher.id);
    expect(() => discussionService.createThread(course.id, student, {
      title: 'Muted',
      body: 'Blocked by restriction.'
    })).toThrow(/restricted/i);
    expect(() => discussionService.getThread(999999, teacher)).toThrow(/discussion thread not found/i);
    expect(() => discussionService.listThreads(999999, teacher)).toThrow(/course not found/i);
  });
});
