import { Injectable } from '@nestjs/common';
import { UserSession } from 'project-structure-database';
import { DisconnectDto, SetSocketDto } from './dto/connect.dto';
import {
    socketError,
    socketInternalError,
    SocketResponse,
    socketSuccess,
} from '../../../common/socket-response';
import { logError } from '../../../utils/logger';
import { ChatService } from '../chat/chat.service';
import {
    findSessionBySocketId,
    updateSessionById,
    updateSessionByUserAndToken,
    findActiveSessionsByUserId,
} from './repository/session.repository';

@Injectable()
export class ConnectService {
    constructor(private readonly chat: ChatService) {}
    async setSocketId(
        data: SetSocketDto
    ): Promise<SocketResponse<UserSession>> {
        try {
            const { token, user_id, socket_id } = data;

            const updatedSession = await updateSessionByUserAndToken(
                user_id!,
                token,
                { socket_id, is_active: true }
            );

            if (!updatedSession) {
                return socketError('Failed to set socket id');
            }

            return socketSuccess('Socket set successfully', updatedSession);
        } catch (error: unknown) {
            logError('setSocketId', error);
            return socketInternalError('Failed to set socket id', error);
        }
    }

    async checkUserIsOnline(data: {
        user_id: number;
    }): Promise<SocketResponse<{ user_id: number }>> {
        try {
            const { user_id } = data;
            const activeSessions = await findActiveSessionsByUserId(user_id);
            const isOnline = activeSessions.length > 0;
            const msg = isOnline ? 'User is online' : 'User is offline';
            return socketSuccess(msg, { user_id });
        } catch (error: unknown) {
            logError('checkUserIsOnline', error);
            return socketInternalError('Failed to check user status', error);
        }
    }

    async disconnectBySocketId(
        data: DisconnectDto
    ): Promise<SocketResponse<{ user_id: number }>> {
        try {
            const { socket_id } = data;

            const session = await findSessionBySocketId(socket_id);
            if (!session) {
                return socketError('User session not found');
            }

            await updateSessionById(session.id, {
                is_active: false,
                socket_id: null,
                chat_room_id: null,
            });

            const user_id = session.user_id;

            if (session.chat_room_id !== null) {
                const activeSessionsSameRoom = (
                    await findActiveSessionsByUserId(user_id)
                ).filter(
                    (s) =>
                        s.chat_room_id === session.chat_room_id &&
                        s.socket_id !== socket_id
                );
                if (activeSessionsSameRoom.length === 0) {
                    await this.chat.changeScreenStatus({
                        chat_room_id: session.chat_room_id,
                        screen_status: false,
                        user_id,
                        socket_id,
                    });
                }
            }

            const stillActive = await findActiveSessionsByUserId(user_id);
            if (stillActive.length === 0) {
                return socketSuccess('User is offline', { user_id });
            }
            return socketError('User is online in other device', { user_id });
        } catch (error: unknown) {
            logError('disconnectBySocketId', error);
            return socketInternalError(
                'Failed to disconnect by socket id',
                error
            );
        }
    }
}
