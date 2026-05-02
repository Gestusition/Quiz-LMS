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
  } else if (user.role === 'teacher') {
    result.department = user.department || '';
    result.officeHours = user.officeHours || '';
  } else if (user.role === 'admin') {
    result.displayName = user.displayName || '';
  }
  return result;
}

module.exports = {
  serializeCurrentUser,
  serializeUser
};
