import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    index,
} from 'drizzle-orm/pg-core';

export const faqs = pgTable(
    'faqs',
    {
        id: serial('id').primaryKey(),
        question: varchar('question', { length: 255 }).notNull(),
        answer: varchar('answer', { length: 255 }).notNull(),
        is_active: boolean('is_active').notNull().default(true),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        faqsActiveIdx: index('faqs_is_active_idx').on(table.is_active),
        faqsDeletedIdx: index('faqs_is_deleted_idx').on(table.is_deleted),
    })
);

export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
