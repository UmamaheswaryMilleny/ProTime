// src/shared/utils/cookie.helper.ts
import type { Response } from 'express';
import { COOKIES_NAMES } from '../constants/constants';

const isProduction = process.env.NODE_ENV === 'production';

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie(COOKIES_NAMES.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie(COOKIES_NAMES.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIES_NAMES.ACCESS_TOKEN);
  res.clearCookie(COOKIES_NAMES.REFRESH_TOKEN);
};

export const setAccessTokenCookie = (
  res: Response,
  accessToken: string
): void => {
  res.cookie(COOKIES_NAMES.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });
};