const STORAGE_KEYS = {
  CURRENT_USER: 'eatathome_current_user',
  USERS: 'eatathome_users',
  ANSWERS: 'eatathome_answers',
};

// User management
export const getCurrentUser = () => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
};

export const setCurrentUser = (userName) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userName);

  // Add to users list if not exists
  const users = getUsers();
  if (!users.includes(userName)) {
    users.push(userName);
    setUsers(users);
  }
};

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getUsers = () => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const setUsers = (users) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const addUser = (userName) => {
  const users = getUsers();
  if (!users.includes(userName)) {
    users.push(userName);
    setUsers(users);
  }
};

// Answer management
// answers structure: { "2026-01-15": { "userName": "home" | "out" | "unknown" } }
export const getAnswers = () => {
  const answers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
  return answers ? JSON.parse(answers) : {};
};

export const setAnswers = (answers) => {
  localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
};

export const getAnswerForDate = (date) => {
  const answers = getAnswers();
  return answers[date] || {};
};

export const setAnswerForDate = (date, userName, status) => {
  const answers = getAnswers();
  if (!answers[date]) {
    answers[date] = {};
  }
  answers[date][userName] = status;
  setAnswers(answers);
};

export const toggleAnswer = (date, userName) => {
  const answers = getAnswers();
  if (!answers[date]) {
    answers[date] = {};
  }

  const currentAnswer = answers[date][userName];
  let newAnswer;

  if (!currentAnswer || currentAnswer === 'unknown') {
    newAnswer = 'home';
  } else if (currentAnswer === 'home') {
    newAnswer = 'out';
  } else {
    newAnswer = 'unknown';
  }

  answers[date][userName] = newAnswer;
  setAnswers(answers);

  return newAnswer;
};
