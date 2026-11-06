# IBO & CO Pharmacy 2.0

A full-stack web app for **IBO & CO**, a pharmacy with two locations in Sarajevo. Customers browse the catalog, fill a cart, place orders for in-store pickup and leave reviews. Staff manage orders, products, categories, users, reviews and contact messages in an admin panel with sales charts.

This is a complete **2.0 rewrite** of my original pharmacy web app (v1: HTML/CSS/jQuery SPA with a PHP REST API and MySQL). The rewrite keeps every v1 feature and the original visual identity, and rebuilds the stack in **TypeScript** end to end.

## Tech stack

| Layer    | Technologies                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, TanStack Table, React Hook Form, Tailwind CSS v4, Radix UI, Recharts, Embla Carousel |
| Backend  | Node.js, Express 5, TypeScript, Drizzle ORM, Zod, JWT (httpOnly cookie), bcrypt, Multer, Pino, Helmet                                          |
| Database | MySQL / MariaDB with versioned SQL migrations                                                                                                  |
| Shared   | Monorepo (npm workspaces) with one shared package for validation schemas, types and business rules used by both frontend and backend           |
| Quality  | Vitest + Supertest integration tests, OpenAPI / Swagger UI documentation generated from the validation schemas                                 |

## Features

**Customers**

- Product catalog with categories, search, sorting, filters and pagination
- Product pages with related products and a notice for prescription-only medicines
- Cart with quantity controls, VAT breakdown and choice of pickup location
- Checkout for in-store pickup at one of two pharmacy locations
- Profile with personal data, order history, order cancellation, password change and account deletion
- Reviews with star ratings and rating overview
- Contact form

**Admin panel**

- Dashboard with revenue, orders, users, products, ratings and unread messages
- Charts for daily orders and revenue, orders by status and revenue by category
- Order management with search, sorting, status filter and inline status changes
- Product and category management with image upload
- User management with roles
- Review moderation and a contact message inbox

**UI and engineering**

- Responsive design with a collapsible sidebar and mobile drawer menu
- Skeleton loaders, empty states, toasts, confirmation dialogs and inline form errors
- Accessible components built on Radix UI
- Layered backend: routes, controllers, services and repositories, organized by feature
- One validation source for both client forms and API requests
- Code splitting, so the admin panel and charts load only for admins

## Getting started

**Requirements:** Node.js 20 or newer and MySQL 8 / MariaDB 10.4+ (for example XAMPP).

1. Start MySQL.
2. Install dependencies and set up the database:

   ```bash
   npm install
   npm run setup
   ```

   `setup` creates `server/.env` from `server/.env.example`, creates the database, runs the migrations and loads demo data. If your MySQL user has a password, edit `server/.env` and run `npm run db:setup`.

3. Start the app:

   ```bash
   npm run dev
   ```

   The app runs at http://localhost:5173 and the API documentation at http://localhost:4000/api/docs.

### Demo accounts (local demo data only)

| Role     | Email               | Password    |
| -------- | ------------------- | ----------- |
| Admin    | `admin@example.com` | `Admin123!` |
| Customer | `kupac@example.com` | `Kupac123!` |

All demo data is fictional.

### Scripts

| Command             | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Starts the API and the React app with live reload                   |
| `npm run setup`     | First-time setup: environment file, database, migrations, demo data |
| `npm run db:seed`   | Resets the database to the demo data                                |
| `npm test`          | Runs the backend integration tests                                  |
| `npm run typecheck` | TypeScript check for all packages                                   |
| `npm run build`     | Production build                                                    |
| `npm start`         | Runs the production build (with `NODE_ENV=production`)              |

## Tests

```bash
npm test
```

Integration tests send real HTTP requests to the API and run against a separate test database that is created automatically. They cover authentication, role-based access, cart and checkout, order and review ownership, and account management.

---

Version 1 was built in 2025 for the IBO & CO pharmacy. Version 2.0 was rewritten in 2026.
