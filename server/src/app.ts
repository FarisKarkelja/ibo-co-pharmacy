import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env, isProduction } from './config/env';
import { openApiDocument } from './docs/openapi';
import { logger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { UPLOADS_DIR } from './middleware/upload';
import { authRouter } from './modules/auth/auth.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { contactRouter } from './modules/contact/contact.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { productsRouter } from './modules/products/products.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { statsRouter } from './modules/stats/stats.routes';
import { usersRouter } from './modules/users/users.routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // The built React app loads its own scripts only; images may come from /uploads.
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => !req.url?.startsWith('/api') },
      // Only method, url and status are logged. Request bodies are never logged.
      serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );

  const api = express.Router();
  api.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  api.use('/auth', authRouter);
  api.use('/users', usersRouter);
  api.use('/categories', categoriesRouter);
  api.use('/products', productsRouter);
  api.use('/cart', cartRouter);
  api.use('/orders', ordersRouter);
  api.use('/reviews', reviewsRouter);
  api.use('/contact', contactRouter);
  api.use('/stats', statsRouter);
  api.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });
  api.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: 'IBO & CO API' }));
  api.use(notFoundHandler);

  app.use('/api', api);
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', fallthrough: false }));

  // In production the API also serves the built React app (one process to deploy).
  const clientDist = path.resolve(process.cwd(), '../client/dist');
  if (isProduction && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '1h', index: false }));
    app.get(/^\/(?!api|uploads).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
