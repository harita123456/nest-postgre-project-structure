import {
    pgTable,
    serial,
    integer,
    varchar,
    timestamp,
    boolean,
    jsonb,
    index,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { chatRooms } from './chat_rooms.schema';
import { messageTypeEnum } from './enum/enums';

export const chats = pgTable(
    'chats',
    {
        id: serial('id').primaryKey(),
        chat_room_id: integer('chat_room_id')
            .notNull()
            .references(() => chatRooms.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        sender_id: integer('sender_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        receiver_id: integer('receiver_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        message_time: timestamp('message_time', { withTimezone: true })
            .defaultNow()
            .notNull(),
        message: varchar('message', { length: 1000 }),
        message_type: messageTypeEnum('message_type').notNull(),
        media_file: jsonb('media_file').$type<
            Array<{
                file_type: 'image' | 'video';
                file_name?: string;
                file_path?: string;
                thumbnail?: string | null;
            }>
        >(),
        is_read: boolean('is_read').notNull().default(false),
        is_edited: boolean('is_edited').notNull().default(false),
        is_delete_by: integer('is_delete_by').array(),
        is_delete_everyone: boolean('is_delete_everyone').notNull().default(false),
        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        chatsRoomIdx: index('chats_chat_room_id_idx').on(table.chat_room_id),
        chatsReadIdx: index('chats_receiver_is_read_idx').on(
            table.receiver_id,
            table.is_read,
        ),
        chatsDeleteEveryoneIdx: index('chats_is_delete_everyone_idx').on(
            table.chat_room_id,
            table.is_delete_everyone,
        ),
    }),
);

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
