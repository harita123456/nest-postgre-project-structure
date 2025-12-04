import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    integer,
    index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { users } from './users.schema';

import { notiForEnum } from './enum/enums';

export const notifications = pgTable(
    'notifications',
    {
        id: serial('id').primaryKey(),
        // Nullable FK (system notifications allowed)
        sender_id: integer('sender_id').references(() => users.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }).default(sql`NULL`),
        receiver_id: integer('receiver_id').references(() => users.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }).default(sql`NULL`),
        receiver_ids: integer('receiver_ids').array(),
        noti_title: varchar('noti_title', { length: 255 }).notNull(),
        noti_msg: varchar('noti_msg', { length: 255 }),
        noti_for: notiForEnum('noti_for').notNull(),
        read_by_user: integer('read_by_user').array(),
        // Array of user IDs who deleted notification; FK cannot be applied to array
        deleted_by_user: integer('deleted_by_user').array(),
        is_deleted: boolean('is_deleted').notNull().default(false),

        created_at: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        notifReceiverDeletedIdx: index(
            'notifications_receiver_is_deleted_idx'
        ).on(table.receiver_id, table.is_deleted),
        notifSenderDeletedIdx: index('notifications_sender_is_deleted_idx').on(
            table.sender_id,
            table.is_deleted
        ),
        notifForIdx: index('notifications_noti_for_idx').on(table.noti_for),
    })
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
