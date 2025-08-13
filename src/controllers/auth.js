import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import UsersCollection from '../models/User.js';
import SessionsCollection from '../models/Session.js';
import { sendResetPasswordEmail } from '../services/emailService.js';
import * as authService from '../services/auth.js';

const getBaseUrl = () => {
  const base = process.env.APP_DOMAIN || 'http://localhost:3000';
  return base.replace(/\/+$/, '');
};

export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await UsersCollection.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    const resetLink = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(
      token,
    )}`;

    try {
      await sendResetPasswordEmail(email, resetLink);
    } catch (err) {
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
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
      throw createHttpError(401, 'Token is expired or invalid.');
    }

    const user = await UsersCollection.findOne({ email: payload.email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
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
