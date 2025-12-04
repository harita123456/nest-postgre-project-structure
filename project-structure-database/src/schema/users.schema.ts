import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    bigint,
    index,
} from 'drizzle-orm/pg-core';

// Enum types
import { userTypeEnum, socialPlatformEnum } from './enum/enums';

export const users = pgTable(
    'users',
    {
        id: serial('id').primaryKey(),
        user_type: userTypeEnum('user_type').notNull().default('user'),
        first_name: varchar('first_name', { length: 255 }),
        last_name: varchar('last_name', { length: 255 }),
        user_name: varchar('user_name', { length: 255 }),
        profile_picture: varchar('profile_picture', { length: 255 }),
        profile_url: varchar('profile_url', { length: 255 }),
        email_address: varchar('email_address', { length: 255 }).notNull(),
        mobile_number: bigint('mobile_number', { mode: 'number' }),
        referral_code: varchar('referral_code', { length: 255 }),

        // Password is stored as a bcrypt hash (see AuthService)
        // Nullable because social-login users don’t require a password
        password: varchar('password', { length: 255 }),

        // Social login flags
        is_social_login: boolean('is_social_login').notNull().default(false),
        social_id: varchar('social_id', { length: 255 }),
        social_platform: socialPlatformEnum('social_platform'),

        customer_id: varchar('customer_id', { length: 255 }),

        is_user_verified: boolean('is_user_verified').notNull().default(false),
        is_blocked_by_admin: boolean('is_blocked_by_admin')
            .notNull()
            .default(false),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        usersUserTypeDeletedIdx: index('users_user_type_is_deleted_idx').on(
            table.user_type,
            table.is_deleted
        ),
        userEmailDeletedIdx: index('users_email_is_deleted_idx').on(
            table.email_address,
            table.is_deleted
        ),
        usersSocialIdx: index('users_social_login_idx').on(
            table.social_id,
            table.social_platform,
            table.is_social_login,
            table.is_deleted
        ),
        usersIsDeletedIdx: index('users_is_deleted_idx').on(table.is_deleted),
    })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
