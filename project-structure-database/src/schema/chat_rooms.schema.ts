import {
    pgTable,
    serial,
    integer,
    boolean,
    timestamp,
    index,
} from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const chatRooms = pgTable(
    'chat_rooms',
    {
        id: serial('id').primaryKey(),
        user_id: integer('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        other_user_id: integer('other_user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        is_delete_by: integer('is_delete_by').array(),
        is_deleted: boolean('is_deleted').notNull().default(false),
        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        chatRoomsUsersIdx: index('chat_rooms_users_idx').on(
            table.user_id,
            table.other_user_id,
        ),
        chatRoomsDeletedIdx: index('chat_rooms_is_deleted_idx').on(table.is_deleted),
    }),
);

export type ChatRoom = typeof chatRooms.$inferSelect;
export type NewChatRoom = typeof chatRooms.$inferInsert;
