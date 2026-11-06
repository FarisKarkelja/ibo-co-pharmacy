import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  tinyint,
  unique,
  varchar,
} from 'drizzle-orm/mysql-core';
import { ORDER_STATUSES, PICKUP_LOCATIONS, REVIEW_LOCATIONS, ROLES } from '@ibo/shared';

// Database schema. It follows the v1 tables, with a few fixes:
// - unique emails and category names
// - one cart row per user and product (quantity is increased instead)
// - cart rows no longer store a price; the current price is always read from products
// - order items keep a snapshot of the product name, so order history survives product deletion
// - cascades so deleting a user or an order cleans up dependent rows
// - new: product images/featured flag, category images, contact messages

const createdAt = () => timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`);

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  role: mysqlEnum('role', ROLES).notNull().default('User'),
  createdAt: createdAt(),
});

export const categories = mysqlTable('categories', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 500 }).notNull().default(''),
  imageUrl: varchar('image_url', { length: 255 }),
});

export const products = mysqlTable(
  'products',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2, mode: 'number' }).notNull(),
    isPrescriptionRequired: boolean('is_prescription_required').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    imageUrl: varchar('image_url', { length: 255 }),
    categoryId: int('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    createdAt: createdAt(),
  },
  (t) => [index('products_name_idx').on(t.name), check('products_price_positive', sql`${t.price} > 0`)],
);

export const cartItems = mysqlTable(
  'cart_items',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: int('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: int('quantity').notNull(),
  },
  (t) => [
    unique('cart_items_user_product_uq').on(t.userId, t.productId),
    check('cart_items_quantity_positive', sql`${t.quantity} > 0`),
  ],
);

export const orders = mysqlTable(
  'orders',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    pickupLocation: mysqlEnum('pickup_location', PICKUP_LOCATIONS).notNull(),
    status: mysqlEnum('status', ORDER_STATUSES).notNull().default('Active'),
    createdAt: createdAt(),
  },
  (t) => [index('orders_status_idx').on(t.status), index('orders_created_idx').on(t.createdAt)],
);

export const orderItems = mysqlTable(
  'order_items',
  {
    id: int('id').autoincrement().primaryKey(),
    orderId: int('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: int('product_id').references(() => products.id, { onDelete: 'set null' }),
    productName: varchar('product_name', { length: 255 }).notNull(),
    categoryName: varchar('category_name', { length: 255 }).notNull(),
    quantity: int('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  },
  (t) => [check('order_items_quantity_positive', sql`${t.quantity} > 0`)],
);

export const reviews = mysqlTable(
  'reviews',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    location: mysqlEnum('location', REVIEW_LOCATIONS).notNull(),
    rating: tinyint('rating').notNull(),
    comment: varchar('comment', { length: 1000 }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [check('reviews_rating_range', sql`${t.rating} BETWEEN 1 AND 5`)],
);

export const contactMessages = mysqlTable('contact_messages', {
  id: int('id').autoincrement().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: varchar('message', { length: 2000 }).notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: createdAt(),
});
