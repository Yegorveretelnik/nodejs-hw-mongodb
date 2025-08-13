import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

import UsersCollection from '../models/User.js';
import SessionsCollection from '../models/Session.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const signAccessToken = (userId) => {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const signRefreshToken = (userId, jti) => {
  return jwt.sign({ sub: String(userId), jti }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

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

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const jti = randomBytes(16).toString('hex');

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id, jti);

  const now = Date.now();
  const session = await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + THIRTY_DAYS),
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
};

export const refreshUserSession = async (refreshTokenFromCookie) => {
  let payload;
  try {
    payload = jwt.verify(refreshTokenFromCookie, process.env.JWT_SECRET);
  } catch (e) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  const session = await SessionsCollection.findOne({
    refreshToken: refreshTokenFromCookie,
  });
  if (!session) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  await SessionsCollection.deleteOne({ _id: session._id });

  const jti = randomBytes(16).toString('hex');
  const accessToken = signAccessToken(payload.sub);
  const refreshToken = signRefreshToken(payload.sub, jti);

  const now = Date.now();
  await SessionsCollection.create({
    userId: payload.sub,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + THIRTY_DAYS),
  });

  return { accessToken, refreshToken };
};

export const logoutUser = async (refreshTokenFromCookie) => {
  const session = await SessionsCollection.findOne({
    refreshToken: refreshTokenFromCookie,
  });
  if (!session) {
    throw createHttpError(401, 'Invalid refresh token');
  }
  await SessionsCollection.deleteOne({ _id: session._id });
};

export const changeUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await UsersCollection.findByIdAndUpdate(userId, { password: hashedPassword });
};
