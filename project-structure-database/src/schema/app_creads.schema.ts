import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    index,
} from 'drizzle-orm/pg-core';

export const appCreads = pgTable(
    'app_creads',
    {
        id: serial('id').primaryKey(),
        app_key: varchar('app_key', { length: 255 }).notNull(),
        app_secret: varchar('app_secret', { length: 255 }).notNull(),
        environment: varchar('environment', { length: 255 }).notNull(),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        appCreadsEnvDeletedIdx: index(
            'app_creads_environment_is_deleted_idx'
        ).on(table.environment, table.is_deleted),
        appCreadsKeyEnvIdx: index('app_creads_app_key_environment_idx').on(
            table.app_key,
            table.environment
        ),
    })
);

export type AppCread = typeof appCreads.$inferSelect;
export type NewAppCread = typeof appCreads.$inferInsert;
