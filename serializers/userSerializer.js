function serializeUser(user) {
  if (!user) return null;
  const result = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    mustChangeCredentials: user.mustChangeCredentials,
    createdAt: user.createdAt
  };
  return withAcademicIdentity(result, user);
}

function serializeCurrentUser(user) {
  if (!user) return null;
  const result = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    mustChangeCredentials: !!user.mustChangeCredentials,
    createdAt: user.createdAt
  };
  return withAcademicIdentity(result, user);
}

function withAcademicIdentity(result, user) {
  if (user.role === 'student') {
    result.studentNumber = user.studentNumber || '';
    result.cohort = user.cohort || '';
    result.facultyId = user.facultyId || null;
    result.departmentId = user.departmentId || null;
    result.classYearId = user.classYearId || null;
    result.sectionId = user.sectionId || null;
    result.facultyName = user.facultyName || '';
    result.departmentName = user.departmentName || '';
    result.classYearName = user.classYearName || '';
    result.yearNumber = user.yearNumber || null;
    result.sectionName = user.sectionName || '';
  } else if (user.role === 'teacher') {
    result.department = user.department || '';
    result.officeHours = user.officeHours || '';
    result.academicTitle = user.academicTitle || '';
    result.staffNumber = user.staffNumber || '';
    result.facultyId = user.facultyId || null;
    result.departmentId = user.departmentId || null;
    result.facultyName = user.facultyName || '';
    result.departmentName = user.departmentName || '';
  } else if (user.role === 'admin') {
    result.displayName = user.displayName || '';
    result.adminTitle = user.adminTitle || '';
    result.facultyId = user.facultyId || null;
    result.departmentId = user.departmentId || null;
    result.facultyName = user.facultyName || '';
    result.departmentName = user.departmentName || '';
  }
  return result;
}

module.exports = {
  serializeCurrentUser,
  serializeUser
};
