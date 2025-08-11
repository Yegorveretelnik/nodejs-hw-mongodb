import express from 'express';
import { register, login, refresh, logout } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';

import * as authController from '../controllers/auth.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import {
  sendResetEmailSchema,
  resetPwdSchema,
} from '../schemas/resetPwdSchemas.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  authController.sendResetEmail,
);
router.post(
  '/reset-pwd',
  validateBody(resetPwdSchema),
  authController.resetPassword,
);

export default router;
