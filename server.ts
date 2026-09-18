import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import pinoHttp from 'pino-http';
import apiRouter from './server/routes/api';
import { logger } from './server/config/logger';
import { prisma } from './server/config/db';
import { healthCheck } from './server/controllers/health';

const SHUTDOWN_TIMEOUT_MS = 10_000;

function isClientError(error: unknown): error is { status: number; message: string } {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === 'number' && status >= 400 && status < 500;
}

function normalizeErrorStatus(error: unknown): number {
  if (isClientError(error)) return error.status;
  // Multer middleware failures (file size / count limits) never reach a controller.
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === 'string' && code.startsWith('LIMIT_')) return 400;
  return 500;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Structured request logging. Health probes are excluded so Render's
  // periodic checks do not flood the log drain.
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/api/health',
      },
      redact: { paths: ['req.headers.authorization', 'req.headers.cookie'], censor: '[REDACTED]' },
    }),
  );

  // API routes mount
  app.use('/api', apiRouter);

  // Readiness probe: verifies the process can actually reach its database.
  app.get('/api/health', healthCheck);

  // Unknown API routes return JSON 404; the SPA fallback below only handles frontend routes
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Vite dev server middleware in non-production, static delivery in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      res.sendFile(path.join(distPath, 'index.html'), (error) => {
        if (error) next(error);
      });
    });
  }

  // Global error handler: catches anything that escapes a controller.
  // 5xx responses use a generic message so internals are never leaked.
  app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = normalizeErrorStatus(error);
    if (status >= 500) {
      logger.error({ err: error, method: req.method, url: req.url }, 'Unhandled request error');
    }
    if (res.headersSent) {
      next(error);
      return;
    }
    const message = status < 500 && error instanceof Error && error.message ? error.message : 'Internal server error';
    res.status(status).json({ error: message });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, `Vendoora fullstack engine online at http://0.0.0.0:${PORT}`);
  });

  // Drain in-flight requests, close the listener, then disconnect Prisma.
  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Graceful shutdown started');
    server.close(() => {
      prisma
        .$disconnect()
        .catch((error) => logger.error({ err: error }, 'Error while disconnecting Prisma'))
        .finally(() => {
          logger.info('Graceful shutdown complete');
          process.exit(0);
        });
    });
    // Render sends SIGTERM and expects the process to exit promptly.
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled rejections are logged and kept alive so a single stray promise
  // does not drop a healthy process; the next request will surface the failure.
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });

  // An uncaught exception leaves the process in an unsafe state: exit so the
  // platform restarts it.
  process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught exception; exiting');
    process.exit(1);
  });
}

startServer();
