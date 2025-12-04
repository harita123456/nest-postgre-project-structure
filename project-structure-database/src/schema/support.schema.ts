import {
    pgTable,
    serial,
    varchar,
    text,
    timestamp,
    boolean,
    index,
} from 'drizzle-orm/pg-core';

export const supports = pgTable(
    'supports',
    {
        id: serial('id').primaryKey(),

        // Who created the support ticket
        full_name: varchar('full_name', { length: 255 }),
        email_address: varchar('email_address', { length: 255 }),
        subject: varchar('subject', { length: 255 }).notNull(),
        message: text('message').notNull(),
        attachment_url: varchar('attachment_url', { length: 255 }),

        is_resolved: boolean('is_resolved').notNull().default(false),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        supportsUserDeletedIdx: index('supports_user_is_deleted_idx').on(
            table.email_address,
            table.is_deleted
        ),
        supportsResolvedIdx: index('supports_is_resolved_idx').on(
            table.is_resolved
        ),
        supportsDeletedIdx: index('supports_is_deleted_idx').on(
            table.is_deleted
        ),
    })
);

export type Support = typeof supports.$inferSelect;
export type NewSupport = typeof supports.$inferInsert;
