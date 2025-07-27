import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';

import UsersCollection from '../db/models/user.js';
import SessionsCollection from '../db/models/session.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await UsersCollection.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UsersCollection.create({
    name,
    email,
    password: hashedPassword,
  });

  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Unauthorized');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  const now = Date.now();

  const session = await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + THIRTY_DAYS),
  });

  return { accessToken, refreshToken, session };
};

export const refreshSession = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie) {
    throw createHttpError(401, 'Refresh token missing');
  }

  const session = await SessionsCollection.findOne({
    refreshToken: refreshTokenFromCookie,
  });
  if (!session) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await SessionsCollection.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Refresh token expired');
  }

  await SessionsCollection.deleteOne({ userId: session.userId });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const now = Date.now();

  const newSession = await SessionsCollection.create({
    userId: session.userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + THIRTY_DAYS),
  });

  return { accessToken, refreshToken, newSession };
};

export const logoutUser = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie) {
    throw createHttpError(401, 'Refresh token missing');
  }

  const session = await SessionsCollection.findOne({
    refreshToken: refreshTokenFromCookie,
  });
  if (!session) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  await SessionsCollection.deleteOne({ _id: session._id });
};
