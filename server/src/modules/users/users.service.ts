import type { ChangePasswordInput, Role, UpdateProfileInput } from '@ibo/shared';
import { hashPassword, verifyPassword } from '../../lib/auth-tokens';
import { badRequest, conflict, notFound } from '../../lib/errors';
import { toUser, usersRepository } from './users.repository';

export const usersService = {
  async getById(id: number) {
    const row = await usersRepository.findById(id);
    if (!row) throw notFound('Korisnik ne postoji.');
    return toUser(row);
  },

  async list() {
    const rows = await usersRepository.listWithOrderCount();
    return rows.map(({ user, orderCount }) => ({ ...toUser(user), orderCount }));
  },

  async updateProfile(id: number, input: UpdateProfileInput) {
    const row = await usersRepository.update(id, input);
    if (!row) throw notFound('Korisnik ne postoji.');
    return toUser(row);
  },

  async changePassword(id: number, input: ChangePasswordInput) {
    const row = await usersRepository.findById(id);
    if (!row) throw notFound('Korisnik ne postoji.');
    if (!(await verifyPassword(input.currentPassword, row.passwordHash))) {
      throw badRequest('Trenutna lozinka nije ispravna.', { currentPassword: ['Trenutna lozinka nije ispravna.'] });
    }
    if (input.currentPassword === input.newPassword) {
      throw badRequest('Nova lozinka mora biti drugačija od trenutne.', {
        newPassword: ['Nova lozinka mora biti drugačija od trenutne.'],
      });
    }
    await usersRepository.update(id, { passwordHash: await hashPassword(input.newPassword) });
  },

  /** Self-service account deletion; requires the password as confirmation. */
  async deleteOwnAccount(id: number, password: string) {
    const row = await usersRepository.findById(id);
    if (!row) throw notFound('Korisnik ne postoji.');
    if (!(await verifyPassword(password, row.passwordHash))) {
      throw badRequest('Lozinka nije ispravna.', { password: ['Lozinka nije ispravna.'] });
    }
    await this.ensureNotLastAdmin(row.role);
    await usersRepository.delete(id);
  },

  async deleteByAdmin(adminId: number, id: number) {
    if (adminId === id) throw conflict('Ne možete obrisati vlastiti nalog iz admin panela.');
    const row = await usersRepository.findById(id);
    if (!row) throw notFound('Korisnik ne postoji.');
    await this.ensureNotLastAdmin(row.role);
    await usersRepository.delete(id);
  },

  async changeRole(adminId: number, id: number, role: Role) {
    if (adminId === id) throw conflict('Ne možete promijeniti vlastitu ulogu.');
    const row = await usersRepository.findById(id);
    if (!row) throw notFound('Korisnik ne postoji.');
    if (row.role === 'Admin' && role !== 'Admin') await this.ensureNotLastAdmin('Admin');
    return toUser((await usersRepository.update(id, { role }))!);
  },

  async ensureNotLastAdmin(role: Role) {
    if (role === 'Admin' && (await usersRepository.countAdmins()) <= 1) {
      throw conflict('Sistem mora imati barem jednog administratora.');
    }
  },
};
