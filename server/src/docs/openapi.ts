import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z, type ZodTypeAny } from 'zod';
import {
  addToCartSchema,
  categorySchema,
  changePasswordSchema,
  checkoutSchema,
  contactSchema,
  deleteAccountSchema,
  loginSchema,
  orderQuerySchema,
  productQuerySchema,
  productSchema,
  registerSchema,
  reviewQuerySchema,
  reviewSchema,
  reviewUpdateSchema,
  updateCartItemSchema,
  updateOrderStatusSchema,
  updateProfileSchema,
  updateRoleSchema,
} from '@ibo/shared';

// OpenAPI document generated from the same zod schemas the API validates with,
// so the docs at /api/docs cannot drift from the real request rules.

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();
registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'iboco_session',
});

type Access = 'public' | 'user' | 'admin';
interface Route {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  tag: string;
  summary: string;
  access: Access;
  body?: ZodTypeAny;
  multipart?: boolean;
  query?: z.AnyZodObject;
  params?: string[];
  status?: number;
}

const json = (schema: ZodTypeAny) => ({ content: { 'application/json': { schema } } });

const routes: Route[] = [
  { method: 'post', path: '/auth/register', tag: 'Auth', summary: 'Register a customer account (role is always User)', access: 'public', body: registerSchema, status: 201 },
  { method: 'post', path: '/auth/login', tag: 'Auth', summary: 'Log in and receive the session cookie', access: 'public', body: loginSchema },
  { method: 'post', path: '/auth/logout', tag: 'Auth', summary: 'Log out (clears the session cookie)', access: 'public', status: 204 },
  { method: 'get', path: '/auth/me', tag: 'Auth', summary: 'Current user, or null for guests', access: 'public' },

  { method: 'get', path: '/users/me', tag: 'Users', summary: 'Own profile', access: 'user' },
  { method: 'patch', path: '/users/me', tag: 'Users', summary: 'Update own name and phone', access: 'user', body: updateProfileSchema },
  { method: 'patch', path: '/users/me/password', tag: 'Users', summary: 'Change own password', access: 'user', body: changePasswordSchema },
  { method: 'delete', path: '/users/me', tag: 'Users', summary: 'Delete own account (password confirmation)', access: 'user', body: deleteAccountSchema, status: 204 },
  { method: 'get', path: '/users', tag: 'Users', summary: 'List users with order counts', access: 'admin' },
  { method: 'get', path: '/users/{id}', tag: 'Users', summary: 'User details', access: 'admin', params: ['id'] },
  { method: 'patch', path: '/users/{id}/role', tag: 'Users', summary: 'Change user role', access: 'admin', params: ['id'], body: updateRoleSchema },
  { method: 'delete', path: '/users/{id}', tag: 'Users', summary: 'Delete user', access: 'admin', params: ['id'], status: 204 },

  { method: 'get', path: '/categories', tag: 'Categories', summary: 'List categories with product counts', access: 'public' },
  { method: 'get', path: '/categories/{id}', tag: 'Categories', summary: 'Category details', access: 'public', params: ['id'] },
  { method: 'post', path: '/categories', tag: 'Categories', summary: 'Create category (optional image)', access: 'admin', body: categorySchema, multipart: true, status: 201 },
  { method: 'patch', path: '/categories/{id}', tag: 'Categories', summary: 'Update category', access: 'admin', params: ['id'], body: categorySchema.partial(), multipart: true },
  { method: 'delete', path: '/categories/{id}', tag: 'Categories', summary: 'Delete empty category', access: 'admin', params: ['id'], status: 204 },

  { method: 'get', path: '/products', tag: 'Products', summary: 'Search, filter, sort and paginate products', access: 'public', query: productQuerySchema },
  { method: 'get', path: '/products/{id}', tag: 'Products', summary: 'Product details', access: 'public', params: ['id'] },
  { method: 'post', path: '/products', tag: 'Products', summary: 'Create product (optional image)', access: 'admin', body: productSchema, multipart: true, status: 201 },
  { method: 'patch', path: '/products/{id}', tag: 'Products', summary: 'Update product', access: 'admin', params: ['id'], body: productSchema.partial(), multipart: true },
  { method: 'delete', path: '/products/{id}', tag: 'Products', summary: 'Delete product', access: 'admin', params: ['id'], status: 204 },

  { method: 'get', path: '/cart', tag: 'Cart', summary: 'Own cart with subtotal, VAT (17%) and total', access: 'user' },
  { method: 'post', path: '/cart/items', tag: 'Cart', summary: 'Add product (price is taken from the database)', access: 'user', body: addToCartSchema, status: 201 },
  { method: 'patch', path: '/cart/items/{productId}', tag: 'Cart', summary: 'Set quantity', access: 'user', params: ['productId'], body: updateCartItemSchema },
  { method: 'delete', path: '/cart/items/{productId}', tag: 'Cart', summary: 'Remove product', access: 'user', params: ['productId'] },
  { method: 'delete', path: '/cart', tag: 'Cart', summary: 'Empty the cart', access: 'user' },

  { method: 'post', path: '/orders/checkout', tag: 'Orders', summary: 'Create an order from the cart (transaction)', access: 'user', body: checkoutSchema, status: 201 },
  { method: 'get', path: '/orders/me', tag: 'Orders', summary: 'Own orders', access: 'user' },
  { method: 'get', path: '/orders/me/{id}', tag: 'Orders', summary: 'Own order details', access: 'user', params: ['id'] },
  { method: 'post', path: '/orders/me/{id}/cancel', tag: 'Orders', summary: 'Cancel own active order', access: 'user', params: ['id'] },
  { method: 'get', path: '/orders', tag: 'Orders', summary: 'All orders (optional status filter)', access: 'admin', query: orderQuerySchema },
  { method: 'get', path: '/orders/{id}', tag: 'Orders', summary: 'Order details', access: 'admin', params: ['id'] },
  { method: 'patch', path: '/orders/{id}/status', tag: 'Orders', summary: 'Change order status', access: 'admin', params: ['id'], body: updateOrderStatusSchema },
  { method: 'delete', path: '/orders/{id}', tag: 'Orders', summary: 'Delete order', access: 'admin', params: ['id'], status: 204 },

  { method: 'get', path: '/reviews', tag: 'Reviews', summary: 'Latest reviews', access: 'public', query: reviewQuerySchema },
  { method: 'get', path: '/reviews/summary', tag: 'Reviews', summary: 'Average rating and distribution', access: 'public' },
  { method: 'post', path: '/reviews', tag: 'Reviews', summary: 'Write a review', access: 'user', body: reviewSchema, status: 201 },
  { method: 'patch', path: '/reviews/{id}', tag: 'Reviews', summary: 'Edit review (author or admin)', access: 'user', params: ['id'], body: reviewUpdateSchema },
  { method: 'delete', path: '/reviews/{id}', tag: 'Reviews', summary: 'Delete review (author or admin)', access: 'user', params: ['id'], status: 204 },

  { method: 'post', path: '/contact', tag: 'Contact', summary: 'Send a contact message', access: 'public', body: contactSchema, status: 201 },
  { method: 'get', path: '/contact', tag: 'Contact', summary: 'Inbox', access: 'admin' },
  { method: 'patch', path: '/contact/{id}/read', tag: 'Contact', summary: 'Mark message as read/unread', access: 'admin', params: ['id'] },
  { method: 'delete', path: '/contact/{id}', tag: 'Contact', summary: 'Delete message', access: 'admin', params: ['id'], status: 204 },

  { method: 'get', path: '/stats/overview', tag: 'Statistics', summary: 'Dashboard totals', access: 'admin' },
  { method: 'get', path: '/stats/revenue-by-category', tag: 'Statistics', summary: 'Revenue per category', access: 'admin' },
  { method: 'get', path: '/stats/orders-by-status', tag: 'Statistics', summary: 'Order count per status', access: 'admin' },
  { method: 'get', path: '/stats/daily-orders', tag: 'Statistics', summary: 'Orders and revenue per day', access: 'admin' },
];

const accessNote: Record<Access, string> = {
  public: 'Public.',
  user: 'Requires login.',
  admin: 'Requires an Admin account.',
};

for (const r of routes) {
  const status = r.status ?? 200;
  registry.registerPath({
    method: r.method,
    path: r.path,
    tags: [r.tag],
    summary: r.summary,
    description: accessNote[r.access],
    security: r.access === 'public' ? [] : [{ cookieAuth: [] }],
    request: {
      params: r.params ? z.object(Object.fromEntries(r.params.map((p) => [p, z.coerce.number().int()]))) : undefined,
      query: r.query,
      body: r.body
        ? r.multipart
          ? {
              content: {
                'multipart/form-data': {
                  schema: (r.body as z.AnyZodObject).extend({
                    image: z.any().openapi({ type: 'string', format: 'binary' }).optional(),
                  }),
                },
              },
            }
          : json(r.body)
        : undefined,
    },
    responses: {
      [status]: { description: status === 204 ? 'No content' : 'Success' },
      ...(r.body || r.query ? { 400: { description: 'Validation error' } } : {}),
      ...(r.access !== 'public' ? { 401: { description: 'Not logged in' } } : {}),
      ...(r.access === 'admin' ? { 403: { description: 'Not an admin' } } : {}),
    },
  });
}

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'IBO & CO Pharmacy API',
    version: '2.0.0',
    description:
      'REST API of the IBO & CO pharmacy web app. Authentication uses an httpOnly session cookie set by /auth/login. Prices are in KM (BAM) without VAT.',
  },
  servers: [{ url: '/api' }],
});
