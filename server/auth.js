import { createHash, randomBytes } from 'crypto';
import { getAdminUsers } from './shared.js';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
const activeTokens = new Map();

const sanitizeUser = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const hashPassword = (password) => {
  return createHash('sha256').update(password).digest('hex');
};

export const verifyCredentials = async (email, password) => {
  const users = await getAdminUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return null;
  }

  const hash = hashPassword(password);
  if (hash !== user.passwordHash) {
    return null;
  }

  return sanitizeUser(user);
};

export const issueToken = (user) => {
  const token = randomBytes(32).toString('hex');
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_TTL_MS;
  const record = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? 'admin',
    issuedAt,
    expiresAt,
  };
  activeTokens.set(token, record);
  return record;
};

export const validateToken = (token) => {
  if (!token) {
    return null;
  }

  const record = activeTokens.get(token);
  if (!record) {
    return null;
  }

  if (Date.now() > record.expiresAt) {
    activeTokens.delete(token);
    return null;
  }

  return record;
};

export const revokeToken = (token) => {
  if (!token) {
    return;
  }
  activeTokens.delete(token);
};

export const getSession = (token) => {
  const record = validateToken(token);
  if (!record) {
    return null;
  }
  return {
    token: record.token,
    expiresAt: record.expiresAt,
    admin: {
      id: record.userId,
      email: record.email,
      name: record.name,
      role: record.role,
    },
  };
};
