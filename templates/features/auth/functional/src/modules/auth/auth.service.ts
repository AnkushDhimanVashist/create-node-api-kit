import { unauthorized } from '../../common/errors.js';
import { signAccessToken } from '../../lib/jwt.js';
import type { AuthUser } from '../../lib/jwt.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { toPublicUser } from '../users/user.entity.js';
import { userRepository } from '../users/user.repository.js';
import { userService } from '../users/user.service.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

// Compared against when the email does not exist, so a login takes the same
// time whether or not the account exists (prevents user enumeration).
const DUMMY_HASH = '$2b$12$biAjPVc8ghmzhC6.eRDH4eOTXcL59YoHV7BxCMQ1Vu4ahpWhP7i8O';

export const authService = {
  async register({ password, ...profile }: RegisterInput) {
    const user = await userService.create({ ...profile, passwordHash: await hashPassword(password) });
    return { user, accessToken: signAccessToken(user) };
  },

  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw unauthorized('Invalid email or password');
    return { user: toPublicUser(user), accessToken: signAccessToken(user) };
  },

  me(authUser: AuthUser) {
    return userService.getById(authUser.id);
  },
};
