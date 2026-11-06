import { z } from 'zod';
import {
  MAX_CART_QUANTITY,
  ORDER_STATUSES,
  PICKUP_LOCATIONS,
  REVIEW_LOCATIONS,
  ROLES,
} from './constants';

// Validation schemas used on both sides: the API validates every request with
// them and the React forms use the same rules, so messages always match.

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} je obavezno polje.` })
    .trim()
    .min(min, min <= 1 ? `${label} je obavezno polje.` : `${label} mora imati najmanje ${min} znaka.`)
    .max(max, `${label} može imati najviše ${max} znakova.`);

export const emailSchema = z
  .string({ required_error: 'Email je obavezno polje.' })
  .trim()
  .toLowerCase()
  .min(1, 'Email je obavezno polje.')
  .max(255)
  .email('Unesite ispravnu email adresu.');

export const passwordSchema = z
  .string({ required_error: 'Lozinka je obavezno polje.' })
  .min(8, 'Lozinka mora imati najmanje 8 znakova.')
  .max(72, 'Lozinka može imati najviše 72 znaka.')
  .regex(/[a-z]/, 'Lozinka mora sadržavati malo slovo.')
  .regex(/[A-Z]/, 'Lozinka mora sadržavati veliko slovo.')
  .regex(/\d/, 'Lozinka mora sadržavati broj.')
  .regex(/[\W_]/, 'Lozinka mora sadržavati specijalni znak.');

export const phoneSchema = z
  .string({ required_error: 'Telefon je obavezno polje.' })
  .trim()
  .regex(/^[0-9]{9,15}$/, 'Telefon smije sadržavati samo brojeve (9-15 cifara).');

export const fullNameSchema = trimmed(3, 255, 'Ime i prezime');

// ---------- Auth ----------

export const registerSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Lozinka je obavezno polje.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- Profile ----------

export const updateProfileSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Unesite trenutnu lozinku.'),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Unesite lozinku za potvrdu.'),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const updateRoleSchema = z.object({
  role: z.enum(ROLES),
});

// ---------- Catalog ----------

export const categorySchema = z.object({
  name: trimmed(2, 255, 'Naziv kategorije'),
  description: z.string().trim().max(500, 'Opis može imati najviše 500 znakova.').optional().default(''),
});
export type CategoryInput = z.infer<typeof categorySchema>;

const booleanish = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1');

/** Product fields arrive as multipart form data, so numbers and booleans are coerced. */
export const productSchema = z.object({
  name: trimmed(2, 255, 'Naziv proizvoda'),
  description: trimmed(5, 500, 'Opis proizvoda'),
  price: z.coerce
    .number({ invalid_type_error: 'Cijena mora biti broj.' })
    .positive('Cijena mora biti veća od 0.')
    .max(99999999, 'Cijena je prevelika.')
    .transform((v) => Math.round(v * 100) / 100),
  categoryId: z.coerce.number().int().positive('Odaberite kategoriju.'),
  isPrescriptionRequired: booleanish.default(false),
  isFeatured: booleanish.default(false),
});
export type ProductInput = z.input<typeof productSchema>;

export const productUpdateSchema = productSchema.partial();

export const PRODUCT_SORTS = ['newest', 'name-asc', 'name-desc', 'price-asc', 'price-desc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const productQuerySchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(100).optional(),
  featured: booleanish.optional(),
  prescription: booleanish.optional(),
  sort: z.enum(PRODUCT_SORTS).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type ProductQuery = z.input<typeof productQuerySchema>;

// ---------- Cart & orders ----------

const quantity = z.coerce
  .number()
  .int('Količina mora biti cijeli broj.')
  .min(1, 'Količina mora biti najmanje 1.')
  .max(MAX_CART_QUANTITY, `Količina može biti najviše ${MAX_CART_QUANTITY}.`);

export const addToCartSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: quantity.default(1),
});
export type AddToCartInput = z.input<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({ quantity });

export const checkoutSchema = z.object({
  pickupLocation: z.enum(PICKUP_LOCATIONS, {
    errorMap: () => ({ message: 'Odaberite lokaciju preuzimanja.' }),
  }),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const orderQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
});

// ---------- Reviews ----------

export const reviewSchema = z.object({
  location: z.enum(REVIEW_LOCATIONS, { errorMap: () => ({ message: 'Odaberite lokaciju.' }) }),
  rating: z.coerce.number().int().min(1, 'Odaberite ocjenu.').max(5),
  comment: trimmed(3, 1000, 'Komentar'),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewUpdateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: trimmed(3, 1000, 'Komentar'),
});

export const reviewQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  location: z.enum(REVIEW_LOCATIONS).optional(),
});

// ---------- Contact ----------

export const contactSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  message: trimmed(10, 2000, 'Poruka'),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ---------- Common ----------

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
