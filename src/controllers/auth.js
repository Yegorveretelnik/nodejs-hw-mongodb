import * as authService from '../services/auth.js';
import { sendResetPasswordEmail } from '../services/emailService.js';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import UsersCollection from '../models/User.js';
import SessionsCollection from '../models/Session.js';

const getBaseUrl = () => {
  const base = process.env.APP_DOMAIN || 'http://localhost:3000';
  return base.replace(/\/+$/, '');
};
const buildResetLink = (token) => {
  return `${getBaseUrl()}/auth/reset-password?token=${encodeURIComponent(
    token,
  )}`;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser({ name, email, password });
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
      path: '/',
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    if (!refreshTokenFromCookie) {
      throw createHttpError(401, 'Refresh token not provided');
    }

    const { accessToken, refreshToken } = await authService.refreshUserSession(
      refreshTokenFromCookie,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
      path: '/',
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    if (!refreshTokenFromCookie) {
      throw createHttpError(401, 'Refresh token not provided');
    }

    await authService.logoutUser(refreshTokenFromCookie);

    res.clearCookie('refreshToken', { path: '/' });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged out a user!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await UsersCollection.findOne({ email });
    if (!user) {
      return res.status(200).json({
        status: 200,
        message:
          'If the email exists in our system, a reset link has been sent.',
        data: {},
      });
    }

    const token = jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    const resetLink = buildResetLink(token);
    await sendResetPasswordEmail(email, resetLink);

    res.status(200).json({
      status: 200,
      message: 'Reset email sent',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      throw createHttpError(400, 'Invalid or expired token');
    }

    const user = await UsersCollection.findById(payload.sub);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    await authService.changeUserPassword(user._id, password);
    await SessionsCollection.deleteMany({ userId: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
