import crypto from 'crypto';
import split from 'lodash/split';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { User } from '~/models';
import { UsersService } from '~/services/users/users.service';

const verifyEntryCode = (req, theUid: string) => {
  const [eIv, payload] = split(req.headers['xc-entry'] || '', ',');
  if (!eIv && payload) { return 0 }
  try {
    const iv = Buffer.from(eIv, 'hex');
    const encryptedText = Buffer.from(payload, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.NC_SERVER_HMAC_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const { uid, iat } = JSON.parse(decrypted.toString());
    if (uid === theUid && (new Date().getTime() - parseInt(iat) < 1000 * 60 * 60 * 2)) {
      return 1
    } else {
      return 0
    }
  } catch (err) {
    return 0
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(options, private userService: UsersService) {
    super({
      expiresIn: '10h',
      ...options,
    });
  }

  async validate(req, jwtPayload) {
    if (!jwtPayload?.email) return jwtPayload;

    const user = await User.getByEmail(jwtPayload?.email);

    if (verifyEntryCode(req, user.uid) === 1) {
      return User.getWithRoles(user.id, {
        user,
        baseId: req.ncProjectId,
      });
    }

    if (
      !user.token_version ||
      !jwtPayload.token_version ||
      user.token_version !== jwtPayload.token_version
    ) {
      throw new Error('Token Expired. Please login again.');
    }

    return User.getWithRoles(user.id, {
      user,
      baseId: req.ncProjectId,
    });
  }
}
