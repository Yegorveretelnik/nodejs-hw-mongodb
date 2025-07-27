import * as authService from '../services/auth.js';

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
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshSession(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
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
    const { refreshToken } = req.cookies;

    await authService.logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
