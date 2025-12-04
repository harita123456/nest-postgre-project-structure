import { Injectable } from '@nestjs/common';
import {
    SocketResponse,
    socketSuccess,
    socketInternalError,
    socketError,
} from '../../../common/socket-response';
import {
    CreateRoomDto,
    SendMessageDto,
    GetAllMessageDto,
    EditMessageDto,
    DeleteMessageDto,
    DeleteMessageForEveryoneDto,
    ReadMessageDto,
    DeleteChatRoomDto,
    ChangeScreenStatusDto,
} from './dto/chat.dto';
import { ChatRepository } from './repository/chat.repository';
import { ChatRoom, Chat } from 'project-structure-database';
import { logError } from 'src/utils/logger';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepo: ChatRepository) {}
    async createRoom(data: CreateRoomDto): Promise<SocketResponse<ChatRoom>> {
        try {
            const result = await this.chatRepo.findOrCreateRoom(data);

            return result.created
                ? socketSuccess('Chatroom created', result.room)
                : socketSuccess('Chatroom fetched', result.room);
        } catch (error: unknown) {
            logError('createRoom Error EMIT:', error);
            return socketInternalError('createRoom Error EMIT:', error);
        }
    }

    async sendMessage(data: SendMessageDto): Promise<SocketResponse<Chat>> {
        try {
            const result = await this.chatRepo.sendMessage(data);

            if (!result.created) {
                return socketError<Chat>('Chatroom not found', null);
            }
            return socketSuccess('Message sent', result.message);
        } catch (error: unknown) {
            logError('sendMessage Error EMIT:', error);
            return socketInternalError('sendMessage Error EMIT:', error);
        }
    }

    async getAllMessage(
        data: GetAllMessageDto
    ): Promise<SocketResponse<Chat[]>> {
        try {
            const result = await this.chatRepo.getAllMessage(data);

            if (!result.created) {
                return socketError<Chat[]>('Chatroom not found', null);
            }
            return socketSuccess('Messages fetched', result.messages);
        } catch (error: unknown) {
            logError('getAllMessage Error EMIT:', error);
            return socketInternalError('getAllMessage Error EMIT:', error);
        }
    }

    async editMessage(
        data: EditMessageDto
    ): Promise<SocketResponse<Chat & { is_last_message: boolean }>> {
        try {
            const result = await this.chatRepo.editMessage(data);

            if (!result.created) {
                return socketError<Chat & { is_last_message: boolean }>(
                    'Message not found or permission denied',
                    null
                );
            }
            return socketSuccess('Message edited', result.message);
        } catch (error: unknown) {
            logError('editMessage Error EMIT:', error);
            return socketInternalError('editMessage Error EMIT:', error);
        }
    }

    async deleteMessage(data: DeleteMessageDto): Promise<
        SocketResponse<{
            chat_room_id: number;
            chat_id: number;
            user_id: number;
        }>
    > {
        try {
            const result = await this.chatRepo.deleteMessage(data);

            if (!result.created) {
                return socketError<{
                    chat_room_id: number;
                    chat_id: number;
                    user_id: number;
                }>('Message not found', null);
            }
            return socketSuccess('Message deleted', result.message);
        } catch (error: unknown) {
            logError('deleteMessage Error EMIT:', error);
            return socketInternalError('deleteMessage Error EMIT:', error);
        }
    }

    async deleteMessageForEveryone(data: DeleteMessageForEveryoneDto): Promise<
        SocketResponse<{
            chat_room_id: number;
            chat_id: number;
            user_id: number;
        }>
    > {
        try {
            const result = await this.chatRepo.deleteMessageForEveryone(data);

            if (!result.created) {
                return socketError<{
                    chat_room_id: number;
                    chat_id: number;
                    user_id: number;
                }>('Message not found or permission denied', null);
            }
            return socketSuccess('Message deleted', result.message);
        } catch (error: unknown) {
            logError('deleteMessageForEveryone Error EMIT:', error);
            return socketInternalError(
                'deleteMessageForEveryone Error EMIT:',
                error
            );
        }
    }

    async readMessage(
        data: ReadMessageDto
    ): Promise<SocketResponse<{ chat_room_id: number }>> {
        try {
            const result = await this.chatRepo.readMessage(data);

            return socketSuccess('Message read', result.message);
        } catch (error: unknown) {
            logError('readMessage Error EMIT:', error);
            return socketInternalError('readMessage Error EMIT:', error);
        }
    }

    async deleteChatRoom(
        data: DeleteChatRoomDto
    ): Promise<SocketResponse<{ chat_room_id: number }>> {
        try {
            const result = await this.chatRepo.deleteChatRoom(data);

            if (!result.created) {
                return socketError<{ chat_room_id: number }>(
                    'Chatroom not found',
                    null
                );
            }

            return socketSuccess('Chatroom deleted', result.message);
        } catch (error: unknown) {
            logError('deleteChatRoom Error EMIT:', error);
            return socketInternalError('deleteChatRoom Error EMIT:', error);
        }
    }

    async changeScreenStatus(
        data: ChangeScreenStatusDto
    ): Promise<SocketResponse<ChatRoom>> {
        try {
            const result = await this.chatRepo.changeScreenStatus(data);

            if (!result.created) {
                return socketError<ChatRoom>('Chatroom not found', null);
            }

            return socketSuccess('Screen status changed', result.message);
        } catch (error: unknown) {
            logError('changeScreenStatus Error EMIT:', error);
            return socketInternalError('changeScreenStatus Error EMIT:', error);
        }
    }
}
