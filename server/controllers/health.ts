import { Request, Response } from 'express';
import { prisma } from '../config/db';

const DB_CHECK_TIMEOUT_MS = 2000;

type DatabaseStatus = 'ok' | 'unavailable';

/**
 * Liveness + readiness probe. Runs a cheap `SELECT 1` against Postgres so the
 * platform can tell "process is up" from "process can serve traffic".
 *
 * The response never includes credentials, connection strings, stack traces,
 * or any other internal detail.
 */
export function buildHealthResponse(database: DatabaseStatus, latencyMs: number) {
  const healthy = database === 'ok';
  return {
    statusCode: healthy ? 200 : 503,
    body: {
      status: healthy ? 'ok' : 'error',
      database,
      latencyMs,
      timestamp: new Date(),
    },
  };
}

export async function checkDatabase(timeoutMs = DB_CHECK_TIMEOUT_MS): Promise<DatabaseStatus> {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Database check timed out')), timeoutMs);
      }),
    ]);
    return 'ok';
  } catch {
    return 'unavailable';
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function healthCheck(_req: Request, res: Response) {
  const startedAt = Date.now();
  const database = await checkDatabase();
  const { statusCode, body } = buildHealthResponse(database, Date.now() - startedAt);
  return res.status(statusCode).json(body);
}
