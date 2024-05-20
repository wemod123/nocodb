import jwt from 'jsonwebtoken';
import { ErrorMessages } from 'nocodb-sdk';
import { NcError } from '~/helpers/catchError';

export function verifyPublicToken(vPassowrd: string, password: string) {
  if (vPassowrd && password && password.startsWith(`p__token__`)) {
    const token = password.replace(`p__token__`, ``);
    try {
      const { serviceId } = jwt.verify(
        token,
        process.env.NC_PUBLIC_ACCESS_TOKEN_SECRET,
      ) as any;
      return serviceId === process.env.NC_PUBLIC_ACCESS_SERVICE_ID;
    } catch (e) {
      NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
    }
  } else if (vPassowrd && vPassowrd !== password) {
    NcError.forbidden(ErrorMessages.INVALID_SHARED_VIEW_PASSWORD);
  }

  return true;
}
