import { Module } from '@nestjs/common';
import { IndexGateway } from './index.gateway';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { ChatRepository } from './chat/repository/chat.repository';
import { ConnectService } from './connect/connect.service';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { WsRolesGuard } from '../../common/guards/ws-roles.guard';

const webSocketServerProvider = {
    provide: 'SOCKET_IO_SERVER',
    useValue: null,
};

@Module({
    imports: [],
    providers: [
        ChatRepository,
        IndexGateway,
        ChatGateway,
        ConnectService,
        ChatService,
        SocketAuthGuard,
        WsRolesGuard,
        webSocketServerProvider,
    ],
    exports: [
        ChatRepository,
        IndexGateway,
        ChatGateway,
        webSocketServerProvider,
        ConnectService,
        ChatService,
    ],
})
export class IndexModule {}
