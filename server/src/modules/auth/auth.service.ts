import type { LoginInput, RegisterInput } from '@ibo/shared';
import { hashPassword, signToken, verifyPassword } from '../../lib/auth-tokens';
import { conflict, unauthorized } from '../../lib/errors';
import { toUser, usersRepository } from '../users/users.repository';

// Used when the email does not exist, so a failed login takes the same time
// either way and does not reveal which emails are registered.
const DUMMY_HASH = '$2b$12$bXkpyDKuoaclwmVPpk9F3OSWxF869sBbj1G4.Td7PqbQ9PB0NXpvW';

export const authService = {
  async register(input: RegisterInput) {
    if (await usersRepository.findByEmail(input.email)) {
      throw conflict('Korisnik s ovom email adresom već postoji.');
    }
    // The role is never taken from the request: every new account is a regular user.
    const row = await usersRepository.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      role: 'User',
    });
    return { user: toUser(row), token: signToken({ sub: row.id, role: row.role }) };
  },

  async login(input: LoginInput) {
    const row = await usersRepository.findByEmail(input.email);
    const valid = await verifyPassword(input.password, row?.passwordHash ?? DUMMY_HASH);
    if (!row || !valid) throw unauthorized('Pogrešan email ili lozinka.');
    return { user: toUser(row), token: signToken({ sub: row.id, role: row.role }) };
  },
};
