import {
    ConnectedSocket,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
    UseGuards,
    UsePipes,
    ValidationPipe,
    UseFilters,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ConnectService } from '../connect/connect.service';
import { SocketAuthGuard } from '../../../common/guards/socket-auth.guard';
import { WsExceptionFilter } from '../../../common/filters/ws-exception.filter';
import { SocketData } from '../../../common/interface/socket-user.interface';
import { logError } from '../../../utils/logger';
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
} from './dto/chat.dto';

const NAMESPACE = '/v1';

@UseGuards(SocketAuthGuard)
@UseFilters(new WsExceptionFilter())
@UsePipes(
    new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
    })
)
@WebSocketGateway({ namespace: NAMESPACE })
export class ChatGateway implements OnGatewayDisconnect<SocketData> {
    @WebSocketServer() server!: Server;

    constructor(
        private readonly chat: ChatService,
        private readonly connect: ConnectService
    ) {}

    @SubscribeMessage('createRoom')
    async createRoom(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: CreateRoomDto
    ) {
        try {
            const { id } = client.user;
            const { other_user_id } = payload;
            const createRoomData = await this.chat.createRoom({
                user_id: id,
                other_user_id,
            });
            client.emit('createRoom', createRoomData);
        } catch (error) {
            logError('createRoom Error ON:', error);
            client.emit('createRoom', error);
        }
    }

    @SubscribeMessage('sendMessage')
    async sendMessage(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: SendMessageDto
    ) {
        try {
            const { id } = client.user;
            const {
                chat_room_id,
                receiver_id,
                message_type,
                message,
                media_file,
            } = payload;
            const newMessage = await this.chat.sendMessage({
                sender_id: id,
                chat_room_id: chat_room_id,
                receiver_id: receiver_id,
                message_type: message_type,
                message: message,
                media_file: media_file,
            });
            client.emit('sendMessage', newMessage);
        } catch (error) {
            logError('sendMessage Error ON:', error);
            client.emit('sendMessage', error);
        }
    }

    @SubscribeMessage('getAllMessage')
    async getAllMessage(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: GetAllMessageDto
    ) {
        try {
            const { id } = client.user;
            const { chat_room_id, page, limit } = payload;

            void client.join(chat_room_id.toString());

            const findChats = await this.chat.getAllMessage({
                chat_room_id: chat_room_id,
                user_id: id,
                page: page,
                limit: limit,
            });
            client.emit('getAllMessage', findChats);
        } catch (error) {
            logError('getAllMessage Error ON:', error);
            client.emit('getAllMessage', error);
        }
    }

    @SubscribeMessage('editMessage')
    async editMessage(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: EditMessageDto
    ) {
        try {
            const { id } = client.user;
            const { chat_id, chat_room_id, message } = payload;

            void client.join(chat_room_id.toString());

            const edited = await this.chat.editMessage({
                chat_id,
                chat_room_id,
                user_id: id,
                message,
            });
            client.emit('editMessage', edited);
        } catch (error) {
            logError('editMessage Error ON:', error);
            client.emit('editMessage', error);
        }
    }

    @SubscribeMessage('deleteMessage')
    async deleteMessage(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: DeleteMessageDto
    ) {
        try {
            const { id } = client.user;
            const { chat_id, chat_room_id } = payload;

            void client.join(chat_room_id.toString());

            const deleted = await this.chat.deleteMessage({
                chat_room_id,
                chat_id,
                user_id: id,
            });
            client.emit('deleteMessage', deleted);
        } catch (error) {
            logError('deleteMessage Error ON:', error);
            client.emit('deleteMessage', error);
        }
    }

    @SubscribeMessage('deleteMessageForEveryone')
    async deleteMessageForEveryone(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: DeleteMessageForEveryoneDto
    ) {
        try {
            const { id } = client.user;
            const { chat_id, chat_room_id } = payload;

            void client.join(chat_room_id.toString());

            const deleted = await this.chat.deleteMessageForEveryone({
                chat_room_id,
                chat_id,
                user_id: id,
            });
            client.emit('deleteMessageForEveryone', deleted);
        } catch (error) {
            logError('deleteMessageForEveryone Error ON:', error);
            client.emit('deleteMessageForEveryone', error);
        }
    }

    @SubscribeMessage('readMessage')
    async readMessage(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: ReadMessageDto
    ) {
        try {
            const { id } = client.user;
            const { chat_room_id } = payload;

            void client.join(chat_room_id.toString());

            const read = await this.chat.readMessage({
                chat_room_id,
                user_id: id,
            });
            client.emit('readMessage', read);
        } catch (error) {
            logError('readMessage Error ON:', error);
            client.emit('readMessage', error);
        }
    }

    @SubscribeMessage('deleteChatRoom')
    async deleteChatRoom(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: DeleteChatRoomDto
    ) {
        try {
            const { id } = client.user;
            const { chat_room_id } = payload;

            const deleted = await this.chat.deleteChatRoom({
                chat_room_id,
                user_id: id,
            });
            client.emit('deleteChatRoom', deleted);
        } catch (error) {
            logError('deleteChatRoom Error ON:', error);
            client.emit('deleteChatRoom', error);
        }
    }

    @SubscribeMessage('changeScreenStatus')
    async changeScreenStatus(
        @ConnectedSocket() client: SocketData,
        @MessageBody() payload: ChangeScreenStatusDto
    ) {
        try {
            const { id } = client.user;

            const { chat_room_id, screen_status } = payload;

            const changed = await this.chat.changeScreenStatus({
                screen_status,
                socket_id: client.id,
                chat_room_id,
                user_id: id,
            });
            client.emit('changeScreenStatus', changed);
        } catch (error) {
            logError('changeScreenStatus Error ON:', error);
            client.emit('changeScreenStatus', error);
        }
    }

    handleDisconnect(client: SocketData): void {
        this.connect
            .disconnectBySocketId({ socket_id: client.id })
            .then((result) => {
                if (result.success) {
                    this.server.emit('userIsOffline', result);
                }
            })
            .catch((error) => {
                logError('disconnect Error ON:', error);
            });
    }
}
