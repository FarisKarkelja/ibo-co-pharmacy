import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { badRequest } from '../lib/errors';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

/** Accepts a single image (jpg, png, webp, max 3 MB) and stores it under uploads/<folder>. */
export function imageUpload(folder: 'products' | 'categories') {
  const dir = path.join(UPLOADS_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: dir,
      // Random names: never trust the original file name from the client.
      filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED.get(file.mimetype)}`),
    }),
    limits: { fileSize: 3 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED.has(file.mimetype)) cb(null, true);
      else cb(badRequest('Dozvoljene su samo slike (JPG, PNG, WEBP).'));
    },
  }).single('image');
}

export const publicUrlFor = (folder: string, filename: string) => `/uploads/${folder}/${filename}`;

/** Deletes a previously uploaded file; ignores files that are not in uploads/. */
export function removeUpload(url: string | null | undefined) {
  if (!url?.startsWith('/uploads/')) return;
  const file = path.join(UPLOADS_DIR, url.replace('/uploads/', ''));
  if (!file.startsWith(UPLOADS_DIR)) return;
  fs.rm(file, { force: true }, () => {});
}
