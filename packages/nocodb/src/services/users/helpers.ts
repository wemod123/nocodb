import crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import type User from '~/models/User';
import type { NcConfig } from '~/interface/config';
import type { Response } from 'express';

export function signRobotApiToken(id: string, config: NcConfig) {
  return jwt.sign({ id }, config.auth.jwt.secret);
}

export function genJwt(user: User, config: NcConfig) {
  const serviceRED = process.env.NC_SERVICE_ROBOT_EMAIL_DOMAIN;
  const serviceRJE = process.env.NC_SERVICE_ROBOT_JWT_EXPIRE;

  const expireOptions =
    serviceRED && serviceRJE && user.email.includes(serviceRED)
      ? { expiresIn: serviceRJE }
      : { expiresIn: '10h', ...(config.auth.jwt.options as any) };

  return jwt.sign(
    {
      email: user.email,
      id: user.id,
      roles: user.roles,
      token_version: user.token_version,
    },
    config.auth.jwt.secret,
    expireOptions,
  );
}

export function verifyPWJwt(
  token: string,
  config: NcConfig,
): { uid: string; tid: string } | null {
  try {
    return jwt.verify(token, config.auth.jwt.secret) as {
      uid: string;
      tid: string;
    } | null;
  } catch (err) {
    return null;
  }
}

export function randomTokenString(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function setTokenCookie(res: Response, token): void {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    domain: process.env.NC_BASE_HOST_NAME || undefined,
  };
  res.cookie('refresh_token', token, cookieOptions);
}
