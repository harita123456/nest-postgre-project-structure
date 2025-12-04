import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import {
    getSecret,
    areSecretsInitialized,
    initializeSecrets,
} from '../config/secrets';
import * as schema from 'project-structure-database';

export let pool!: Pool;
export let db!: ReturnType<typeof drizzle>;

export const initDb = async (): Promise<void> => {
    if (!areSecretsInitialized()) {
        await initializeSecrets();
    }

    if (pool && db) return;

    const host = getSecret('DB_HOSTNAME');
    const user = getSecret('DB_USERNAME');
    const password = getSecret('DB_PASSWORD');
    const database = process.env.DB_NAME;
    const port = Number(process.env.DB_PORT ?? 5432);
    const sslFlag = (process.env.DB_SSL || '').toLowerCase() === 'true';
    const ssl = sslFlag ? ({ rejectUnauthorized: false } as const) : false;

    pool = new Pool({ host, port, user, password, database, ssl });
    db = drizzle(pool, { schema });
};
