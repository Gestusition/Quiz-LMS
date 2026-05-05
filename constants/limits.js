const LIMITS = Object.freeze({
  pagination: Object.freeze({
    defaultPage: 1,
    defaultPageSize: 20,
    maxPageSize: 100
  }),
  users: Object.freeze({
    nameMin: 2,
    nameMax: 80,
    emailMax: 254,
    passwordMin: 8,
    passwordMax: 128,
    usernameMin: 3,
    usernameMax: 32,
    studentNumberMin: 5,
    studentNumberMax: 30,
    employeeNumberMin: 3,
    employeeNumberMax: 30
  }),
  profiles: Object.freeze({
    displayNameMax: 120,
    titleMax: 80,
    departmentLabelMax: 120,
    officeHoursMax: 200,
    cohortMax: 24,
    notesMax: 1000
  }),
  courses: Object.freeze({
    codeMax: 20,
    titleMax: 120,
    descriptionMax: 4000,
    creditsMax: 30
  }),
  offerings: Object.freeze({
    capacityMax: 5000
  }),
  terms: Object.freeze({
    nameMax: 120,
    yearMax: 24
  }),
  quizzes: Object.freeze({
    titleMax: 120,
    descriptionMax: 4000,
    durationMin: 5,
    durationMax: 240,
    attemptsMin: 1,
    attemptsMax: 5,
    totalQuestionsMax: 100,
    penaltyMax: 100,
    sebConfigMax: 500
  }),
  questions: Object.freeze({
    textMax: 2000,
    optionTextMax: 500,
    minOptions: 2,
    maxOptions: 6,
    pointsMax: 100
  }),
  assignments: Object.freeze({
    titleMax: 160,
    descriptionMax: 5000,
    submissionTextMax: 10000,
    submissionUrlMax: 500,
    feedbackMax: 5000,
    gradeMax: 40
  }),
  attendance: Object.freeze({
    topicMax: 160,
    noteMax: 500
  }),
  resources: Object.freeze({
    titleMax: 160,
    descriptionMax: 2000,
    urlMax: 500
  }),
  announcements: Object.freeze({
    titleMax: 160,
    bodyMax: 4000
  }),
  discussions: Object.freeze({
    titleMax: 160,
    bodyMax: 4000
  }),
  imports: Object.freeze({
    fileNameMax: 255,
    rowJsonMax: 20000,
    errorMessageMax: 1000
  }),
  restrictions: Object.freeze({
    reasonMax: 1000
  })
});

module.exports = { LIMITS };
