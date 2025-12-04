import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';

import { appUpdateStatusEnum, appPlatformEnum } from './enum/enums';

export const appVersions = pgTable(
    'app_versions',
    {
        id: serial('id').primaryKey(),
        app_version: varchar('app_version', { length: 255 }).notNull(),
        is_maintenance: boolean('is_maintenance').notNull().default(false),
        app_update_status: appUpdateStatusEnum('app_update_status')
            .notNull()
            .default('is_not_need'),
        app_platform: appPlatformEnum('app_platform').notNull(),
        app_url: varchar('app_url', { length: 255 }).notNull(),
        api_base_url: varchar('api_base_url', { length: 255 }).notNull(),
        is_live: boolean('is_live').notNull().default(true),
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
            uniqueVersionPlatform: uniqueIndex('unique_version_platform').on(
                table.app_version,
                table.app_platform
            ),
            appVersionsPlatformLiveDeletedIdx: index(
                'app_versions_platform_is_live_is_deleted_idx'
            ).on(table.app_platform, table.is_live, table.is_deleted),
            appVersionsDeletedIdx: index('app_versions_is_deleted_idx').on(
                table.is_deleted
            ),
        };
    }
);

export type AppVersion = typeof appVersions.$inferSelect;
export type NewAppVersion = typeof appVersions.$inferInsert;
