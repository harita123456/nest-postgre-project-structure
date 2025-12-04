import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    integer,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';

import { users } from './users.schema';
import { chatRooms } from './chat_rooms.schema';

import { userTypeEnum, deviceTypeEnum } from './enum/enums';

// User Sessions Table
export const userSessions = pgTable(
    'user_sessions',
    {
        id: serial('id').primaryKey(),
        user_id: integer('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        user_type: userTypeEnum('user_type').notNull().default('user'),
        device_token: varchar('device_token', { length: 255 }),
        device_type: deviceTypeEnum('device_type').notNull(),
        auth_token: varchar('auth_token', { length: 255 }).notNull(),
        socket_id: varchar('socket_id', { length: 255 }),
        chat_room_id: integer('chat_room_id')
            .references(() => chatRooms.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        // Refresh token support
        refresh_token_hash: varchar('refresh_token_hash', { length: 128 }),
        refresh_expires_at: timestamp('refresh_expires_at', {
            withTimezone: true,
        }),
        is_login: boolean('is_login').notNull().default(false),
        is_active: boolean('is_active').notNull().default(false),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        // 👇 enforce uniqueness per user + device combo
        uniqueDeviceSession: uniqueIndex('unique_device_session').on(
            table.user_id,
            table.user_type,
            table.device_token,
            table.device_type
        ),
        userSessionsAuthDeletedIdx: index(
            'user_sessions_auth_token_is_deleted_idx'
        ).on(table.auth_token, table.is_deleted),
        userSessionsRefreshHashUnique: uniqueIndex(
            'user_sessions_refresh_token_hash_unique'
        ).on(table.refresh_token_hash),
        userSessionsRefreshExpiryIdx: index(
            'user_sessions_refresh_expires_at_idx'
        ).on(table.refresh_expires_at),
        userSessionsUserActiveIdx: index(
            'user_sessions_user_id_is_active_idx'
        ).on(table.user_id, table.is_active),
        userSessionsUserDeletedIdx: index(
            'user_sessions_user_id_is_deleted_idx'
        ).on(table.user_id, table.is_deleted),
    })
);

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
