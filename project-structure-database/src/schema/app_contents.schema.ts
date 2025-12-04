import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    index,
} from 'drizzle-orm/pg-core';

import { contentTypeEnum } from './enum/enums';

export const appContents = pgTable(
    'app_contents',
    {
        id: serial('id').primaryKey(),
        content_type: contentTypeEnum('content_type').notNull(),
        content: varchar('content', { length: 255 }).notNull(),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        appContentsTypeDeletedIdx: index('app_contents_type_is_deleted_idx').on(
            table.content_type,
            table.is_deleted
        ),
        appContentsDeletedIdx: index('app_contents_is_deleted_idx').on(
            table.is_deleted
        ),
    })
);

export type AppContent = typeof appContents.$inferSelect;
export type NewAppContent = typeof appContents.$inferInsert;
