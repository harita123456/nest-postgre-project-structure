import { Injectable } from '@nestjs/common';
import {
    chatRooms,
    chats as chatTable,
    userSessions,
    ChatRoom,
    Chat,
} from 'project-structure-database';
import { eq, and, or, desc } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import {
    CreateRoomDto,
    GetAllMessageDto,
    SendMessageDto,
    EditMessageDto,
    DeleteMessageDto,
    DeleteMessageForEveryoneDto,
    ReadMessageDto,
    DeleteChatRoomDto,
    ChangeScreenStatusDto,
} from '../dto/chat.dto';

interface MediaFile {
    file_type: 'image' | 'video';
    file_path?: string;
    file_name?: string;
    thumbnail?: string;
}

interface FindOrCreateRoomResult {
    room: ChatRoom;
    created: boolean;
}

interface SendMessageResult {
    message: Chat | null;
    created: boolean;
}

interface GetAllMessageResult {
    messages: Chat[];
    created: boolean;
}

interface EditMessageResult {
    message: (Chat & { is_last_message: boolean }) | null;
    created: boolean;
}

interface DeleteMessageResult {
    message: {
        chat_room_id: number;
        chat_id: number;
        user_id: number;
    } | null;
    created: boolean;
}

interface ReadMessageResult {
    message: {
        chat_room_id: number;
    };
    created: boolean;
}

interface ChangeScreenStatusResult {
    message: ChatRoom | null;
    created: boolean;
}

interface DeleteChatRoomResult {
    message: {
        chat_room_id: number;
    } | null;
    created: boolean;
}

@Injectable()
export class ChatRepository {
    async findOrCreateRoom(
        data: CreateRoomDto
    ): Promise<FindOrCreateRoomResult> {
        const { user_id, other_user_id } = data;

        const condA = and(
            eq(chatRooms.user_id, user_id),
            eq(chatRooms.other_user_id, other_user_id)
        );
        const condB = and(
            eq(chatRooms.user_id, other_user_id),
            eq(chatRooms.other_user_id, user_id)
        );

        const [existing] = await db
            .select()
            .from(chatRooms)
            .where(and(eq(chatRooms.is_deleted, false), or(condA, condB)))
            .limit(1);

        if (existing) {
            if (existing.is_delete_by?.includes(user_id)) {
                const cleaned = existing.is_delete_by.filter(
                    (id: number) => id !== user_id
                );
                await db
                    .update(chatRooms)
                    .set({ is_delete_by: cleaned })
                    .where(eq(chatRooms.id, existing.id));
                existing.is_delete_by = cleaned;
            }
            return { room: existing, created: false };
        }

        const [newRoom] = await db
            .insert(chatRooms)
            .values({ user_id, other_user_id })
            .returning();

        return { room: newRoom as ChatRoom, created: true };
    }

    async sendMessage(data: SendMessageDto): Promise<SendMessageResult> {
        const {
            sender_id,
            chat_room_id,
            receiver_id,
            message_type,
            message,
            media_file,
        } = data;

        const currentDateTime = new Date();

        const [room] = await db
            .select()
            .from(chatRooms)
            .where(
                and(
                    eq(chatRooms.id, chat_room_id),
                    eq(chatRooms.is_deleted, false)
                )
            )
            .limit(1);

        if (!room) {
            return { message: null, created: false };
        }

        let mediaPayload: MediaFile[] | null = null;
        if (message_type === 'media' && Array.isArray(media_file)) {
            mediaPayload = media_file.map(
                (value): MediaFile => ({
                    file_type: value.file_type as 'image' | 'video',
                    file_path: value.file_path ?? undefined,
                    file_name: value.file_name ?? undefined,
                    ...(value.file_type === 'video' && value.thumbnail
                        ? { thumbnail: value.thumbnail }
                        : {}),
                })
            );
        } else if (
            message_type === 'media' &&
            media_file &&
            !Array.isArray(media_file)
        ) {
            const value = media_file as unknown as MediaFile;
            mediaPayload = [
                {
                    file_type: value.file_type,
                    file_path: value.file_path ?? undefined,
                    file_name: value.file_name ?? undefined,
                    ...(value.file_type === 'video' && value.thumbnail
                        ? { thumbnail: value.thumbnail }
                        : {}),
                },
            ];
        }

        const msgType = message_type as 'text' | 'media';

        const insertData = {
            chat_room_id,
            sender_id,
            receiver_id,
            message_time: currentDateTime,
            message,
            message_type: msgType,
            media_file: mediaPayload,
        };

        const [newMessage] = await db
            .insert(chatTable)
            .values(insertData)
            .returning();

        return { message: newMessage as Chat, created: true };
    }

    async getAllMessage(data: GetAllMessageDto): Promise<GetAllMessageResult> {
        const { chat_room_id, user_id, page, limit } = data;

        const [room] = await db
            .select()
            .from(chatRooms)
            .where(
                and(
                    eq(chatRooms.id, chat_room_id),
                    eq(chatRooms.is_deleted, false)
                )
            )
            .limit(1);

        if (!room) {
            return { messages: [], created: false };
        }

        const messages: Chat[] = await db
            .select()
            .from(chatTable)
            .where(
                and(
                    eq(chatTable.chat_room_id, chat_room_id),
                    eq(chatTable.is_delete_everyone, false)
                )
            )
            .orderBy(desc(chatTable.created_at))
            .limit(limit)
            .offset((page - 1) * limit);

        const filtered = messages.filter((m) => {
            if (!m.is_delete_by) return true;
            return !m.is_delete_by.includes(user_id);
        });

        const BUCKET_URL = process.env.BUCKET_URL ?? '';
        const enriched = filtered.map((msg) => {
            if (msg.media_file && Array.isArray(msg.media_file)) {
                const mediaList = msg.media_file as MediaFile[];
                msg.media_file = mediaList.map((media) => {
                    const file_path = media.file_path
                        ? BUCKET_URL + media.file_path
                        : undefined;
                    const thumbnail =
                        media.file_type === 'video' && media.thumbnail
                            ? BUCKET_URL + media.thumbnail
                            : media.thumbnail;
                    return { ...media, file_path, thumbnail };
                });
            }
            return msg;
        });

        return { messages: enriched, created: true };
    }

    async editMessage(data: EditMessageDto): Promise<EditMessageResult> {
        const { chat_id, chat_room_id, user_id, message } = data;

        const [existing] = await db
            .select()
            .from(chatTable)
            .where(eq(chatTable.id, chat_id))
            .limit(1);

        if (!existing) {
            return { message: null, created: false };
        }

        if (existing.sender_id !== user_id) {
            return { message: null, created: false };
        }

        await db
            .update(chatTable)
            .set({ message, is_edited: true })
            .where(
                and(
                    eq(chatTable.id, chat_id),
                    eq(chatTable.sender_id, user_id),
                    eq(chatTable.chat_room_id, chat_room_id)
                )
            );

        const [edited] = await db
            .select()
            .from(chatTable)
            .where(eq(chatTable.id, chat_id));

        if (!edited) {
            return { message: null, created: false };
        }

        const [last] = await db
            .select()
            .from(chatTable)
            .where(eq(chatTable.chat_room_id, chat_room_id))
            .orderBy(desc(chatTable.created_at))
            .limit(1);

        const is_last_message = last ? last.id === edited.id : false;

        return {
            message: { ...edited, is_last_message } as Chat & {
                is_last_message: boolean;
            },
            created: true,
        };
    }

    async deleteMessage(data: DeleteMessageDto): Promise<DeleteMessageResult> {
        const { chat_id, chat_room_id, user_id } = data;

        const [existing] = await db
            .select()
            .from(chatTable)
            .where(eq(chatTable.id, chat_id))
            .limit(1);

        if (!existing) {
            return { message: null, created: false };
        }

        await db
            .update(chatTable)
            .set({ is_delete_by: [user_id] })
            .where(eq(chatTable.id, chat_id));

        const result = {
            chat_room_id: chat_room_id,
            chat_id: chat_id,
            user_id: user_id,
        };

        return { message: result, created: true };
    }

    async deleteMessageForEveryone(
        data: DeleteMessageForEveryoneDto
    ): Promise<DeleteMessageResult> {
        const { chat_id, chat_room_id, user_id } = data;

        const [existing] = await db
            .select()
            .from(chatTable)
            .where(eq(chatTable.id, chat_id))
            .limit(1);

        if (!existing) {
            return { message: null, created: false };
        }

        if (existing.sender_id !== user_id) {
            return { message: null, created: false };
        }

        await db
            .update(chatTable)
            .set({ is_delete_everyone: true })
            .where(eq(chatTable.id, chat_id));

        const result = {
            chat_room_id: chat_room_id,
            chat_id: chat_id,
            user_id: user_id,
        };

        return { message: result, created: true };
    }

    async readMessage(data: ReadMessageDto): Promise<ReadMessageResult> {
        const { chat_room_id, user_id } = data;

        await db
            .update(chatTable)
            .set({ is_read: true })
            .where(
                and(
                    eq(chatTable.chat_room_id, chat_room_id),
                    eq(chatTable.receiver_id, user_id),
                    eq(chatTable.is_read, false)
                )
            );

        const result = {
            chat_room_id: chat_room_id,
        };

        return { message: result, created: true };
    }

    async deleteChatRoom(
        data: DeleteChatRoomDto
    ): Promise<DeleteChatRoomResult> {
        const { chat_room_id, user_id } = data;

        const [existing] = await db
            .select()
            .from(chatRooms)
            .where(eq(chatRooms.id, chat_room_id))
            .limit(1);

        if (!existing) {
            return { message: null, created: false };
        }

        await db
            .update(chatTable)
            .set({ is_delete_by: [user_id] })
            .where(eq(chatTable.chat_room_id, chat_room_id));

        await db
            .update(chatRooms)
            .set({ is_delete_by: [user_id] })
            .where(eq(chatRooms.id, chat_room_id));

        const result = {
            chat_room_id: chat_room_id,
        };

        return { message: result, created: true };
    }

    async changeScreenStatus(
        data: ChangeScreenStatusDto
    ): Promise<ChangeScreenStatusResult> {
        const { user_id, screen_status, chat_room_id, socket_id } = data;

        const [existing] = await db
            .select()
            .from(chatRooms)
            .where(
                and(
                    eq(chatRooms.id, chat_room_id),
                    eq(chatRooms.is_deleted, false)
                )
            )
            .limit(1);

        if (!existing) {
            return { message: null, created: false };
        }

        if (!socket_id) {
            return { message: null, created: false };
        }

        if (screen_status) {
            await db
                .update(userSessions)
                .set({ chat_room_id: chat_room_id })
                .where(
                    and(
                        eq(userSessions.user_id, user_id),
                        eq(userSessions.socket_id, socket_id)
                    )
                );
        } else {
            await db
                .update(userSessions)
                .set({ chat_room_id: null })
                .where(
                    and(
                        eq(userSessions.user_id, user_id),
                        eq(userSessions.socket_id, socket_id)
                    )
                );
        }

        return { message: existing, created: true };
    }
}
