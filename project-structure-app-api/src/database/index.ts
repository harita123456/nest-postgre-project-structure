import retry from 'async-retry';
import { db, initDb, pool } from './connection';
import { Client } from 'pg';
import { existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { logInfo, logError, logWarn } from '../utils/logger';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { seedMasterData } from 'project-structure-database';
import path from 'path';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const connectToDatabase = async (): Promise<void> => {
    const shouldCreateDb =
        (process.env.DB_CREATE_ON_START ?? 'false') === 'true';
    if (shouldCreateDb) {
        await createDatabaseIfNotExists();
    } else {
        logInfo('⏭️  Skipping database creation (DB_CREATE_ON_START=false).');
    }

    await retry(
        async (bail) => {
            try {
                await initDb();
                if (!pool) {
                    throw new Error('Database pool not initialized');
                }
                const client = await pool.connect();
                await client.query('SELECT 1');
                client.release();
                logInfo('✅ PostgreSQL connected successfully.');

                const migrateOnStart =
                    (process.env.DB_MIGRATE_ON_START ?? 'false') === 'true';

                if (migrateOnStart) {
                    await generateMigrationsIfMissing();
                    await ensureMigrationsJournal();
                    const migrationsFolder =
                        process.env.DRIZZLE_MIGRATIONS_FOLDER || 'drizzle';
                    try {
                        logInfo(
                            `📦 Running migrations from folder: ${migrationsFolder}`
                        );
                        await migrate(db, { migrationsFolder });
                        logInfo(
                            '🗂️  Database migrations applied (up-to-date).'
                        );
                    } catch (migErr) {
                        logWarn(
                            '⚠️  Migration step failed. Attempting full schema push via drizzle-kit push.'
                        );
                        logWarn(String(migErr));
                        try {
                            execSync('npx drizzle-kit push', {
                                stdio: 'inherit',
                            });
                            logInfo('📦 Schema push succeeded.');
                        } catch (pushErr) {
                            logWarn(
                                `❌ Schema push also failed: ${String(pushErr)}`
                            );
                        }
                    }
                } else {
                    logInfo(
                        '⏭️  Skipping automatic migrations on start (DB_MIGRATE_ON_START=false).'
                    );
                }

                const seedOnStart =
                    (process.env.DB_SEED_ON_START ?? 'false') === 'true';
                if (seedOnStart) {
                    try {
                        logInfo('🌱 Seeding master data from JSON...');
                        await seedMasterData(
                            db as unknown as NodePgDatabase<
                                Record<string, never>
                            >
                        );
                        logInfo('🌱 Seeding completed.');
                    } catch (seedErr) {
                        logWarn(
                            '⚠️  Seeding failed. Check your JSON files under src/database/seeds/data.'
                        );
                        logWarn(String(seedErr));
                    }
                } else {
                    logInfo(
                        '⏭️  Skipping master data seeding (DB_SEED_ON_START=false).'
                    );
                }
            } catch (error) {
                logError('❌ Unable to connect to the database:', error);

                const err = error as { code?: string; name?: string };

                const transientCodes = new Set([
                    'ETIMEDOUT',
                    'ECONNREFUSED',
                    'ECONNRESET',
                    'ENOTFOUND',
                ]);

                if (!transientCodes.has(err?.code ?? '')) {
                    bail(error);
                    return;
                }

                throw error;
            }
        },
        {
            retries: 5,
            minTimeout: 2000,
            factor: 2,
            onRetry: (error, attempt) => {
                logError(
                    `❌ Retry attempt ${attempt} after error: ${String(error)}`,
                    error
                );
            },
        }
    );
};

async function createDatabaseIfNotExists(): Promise<void> {
    const {
        DB_HOSTNAME: host,
        DB_PORT,
        DB_USERNAME: user,
        DB_PASSWORD: password,
        DB_NAME: database,
    } = process.env as Record<string, string | undefined>;

    if (!database) {
        logWarn(
            'DB_NAME is not defined; cannot create database automatically.'
        );
        return;
    }

    const adminClient = new Client({
        host,
        port: Number(DB_PORT ?? 5432),
        user,
        password,
        database: 'postgres',
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
    });

    try {
        await adminClient.connect();
        const existsRes = await adminClient.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [database]
        );
        if (existsRes.rowCount === 0) {
            logInfo(`📀 Database "${database}" does not exist. Creating...`);
            await adminClient.query(`CREATE DATABASE "${database}"`);
            logInfo(`✅ Database "${database}" created successfully.`);
        } else {
            logInfo(
                `📀 Database "${database}" already exists. Skipping creation.`
            );
        }
    } catch (err) {
        logWarn(`⚠️  Failed to create database "${database}": ${String(err)}`);
    } finally {
        await adminClient.end();
    }
}

async function generateMigrationsIfMissing(): Promise<void> {
    const migrationsFolder = process.env.DRIZZLE_MIGRATIONS_FOLDER || 'drizzle';
    try {
        const hasMigrations =
            existsSync(migrationsFolder) &&
            readdirSync(migrationsFolder).some((f) => f.endsWith('.sql'));
        if (!hasMigrations) {
            logInfo('🛠️  No migrations found. Generating with drizzle-kit...');
            execSync('npx drizzle-kit generate', { stdio: 'inherit' });
            logInfo('🛠️  Migrations generated successfully.');
        }
    } catch (err) {
        logWarn(
            `⚠️  Failed to generate migrations automatically: ${String(err)}`
        );
    }
}

async function ensureMigrationsJournal(): Promise<void> {
    const migrationsFolder = process.env.DRIZZLE_MIGRATIONS_FOLDER || 'drizzle';
    const metaDir = path.join(migrationsFolder, 'meta');
    const journalPath = path.join(metaDir, '_journal.json');

    try {
        if (!existsSync(metaDir)) {
            mkdirSync(metaDir, { recursive: true });
        }

        if (!existsSync(journalPath)) {
            const files = existsSync(migrationsFolder)
                ? readdirSync(migrationsFolder)
                      .filter((f) => f.endsWith('.sql'))
                      .sort()
                : [];

            const entries = files.map((file, idx) => ({
                idx,
                version: '7',
                when: Date.now(),
                tag: path.basename(file, '.sql'),
                breakpoints: true,
            }));

            const journal = {
                version: '7',
                dialect: 'postgresql',
                entries,
            } as const;

            writeFileSync(journalPath, JSON.stringify(journal, null, 2));
            logInfo(`🧭 Created missing migrations journal at ${journalPath}`);
        }
    } catch (err) {
        logWarn(`⚠️  Failed to ensure migrations journal: ${String(err)}`);
    }
}
