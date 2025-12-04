import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';

export const apiUrls = pgTable(
    'api_urls',
    {
        id: serial('id').primaryKey(),
        environment: varchar('environment', { length: 255 }).notNull(),
        type: varchar('type', { length: 255 }).notNull().default('api'),
        url: varchar('url', { length: 255 }).notNull(),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => {
        return {
            envTypeUnique: uniqueIndex('api_urls_environment_type_unique').on(
                table.environment,
                table.type
            ),
            apiUrlsDeletedIdx: index('api_urls_is_deleted_idx').on(
                table.is_deleted
            ),
        };
    }
);

export type ApiUrl = typeof apiUrls.$inferSelect;
export type NewApiUrl = typeof apiUrls.$inferInsert;
