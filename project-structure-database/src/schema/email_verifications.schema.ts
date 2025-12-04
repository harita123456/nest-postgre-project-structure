import { sql } from 'drizzle-orm';
import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    integer,
    index,
} from 'drizzle-orm/pg-core';

export const emailVerifications = pgTable(
    'email_verifications',
    {
        id: serial('id').primaryKey(),
        email_address: varchar('email_address', { length: 255 })
            .notNull()
            .unique(),
        otp: integer('otp').notNull().default(0),
        otp_expiry_time: timestamp('otp_expiry_time', { withTimezone: true })
            .notNull()
            .default(sql`now() + interval '10 minutes'`),
        is_email_verified: boolean('is_email_verified')
            .notNull()
            .default(false),
        is_deleted: boolean('is_deleted').notNull(),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        emailDeletedIdx: index('email_verif_email_is_deleted_idx').on(
            table.email_address,
            table.is_deleted
        ),
        emailVerifiedDeletedIdx: index(
            'email_verif_email_is_verified_is_deleted_idx'
        ).on(table.email_address, table.is_email_verified, table.is_deleted),
        otpExpiryIdx: index('email_verif_otp_expiry_time_idx').on(
            table.otp_expiry_time
        ),
    })
);

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;
