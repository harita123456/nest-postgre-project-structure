import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {
    Injectable,
    UseGuards,
    UseFilters,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { ConnectService } from './connect/connect.service';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { logError, logInfo, logData } from '../../utils/logger';
import { socketError } from '../../common/socket-response';
import { SocketData } from '../../common/interface/socket-user.interface';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';

const NAMESPACE = '/v1';

const allowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS ?? '';
if (!allowedOriginsEnv) {
    throw new Error(
        'CORS_ORIGINS environment variable must be set for WebSockets'
    );
}
const wsAllowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((o) => o.trim())
    : ['http://localhost:3000'];

if (wsAllowedOrigins.some((o) => o === '*' || o === '/*')) {
    throw new Error(
        'CORS_ORIGINS must not contain "*" when credentials are enabled'
    );
}

@Injectable()
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
@WebSocketGateway({
    namespace: NAMESPACE,
    cors: {
        origin: wsAllowedOrigins,
        credentials: true,
    },
})
export class IndexGateway implements OnGatewayInit, OnGatewayConnection {
    @WebSocketServer() server!: Server;

    constructor(
        private readonly connect: ConnectService,
        private readonly authGuard: SocketAuthGuard
    ) {}

    private logRes(event: string, client: SocketData, res: unknown) {
        try {
            const ok = res;
            logData(`[WS] ${event}:res`, {
                socket_id: client.id,
                user_id: client?.user?.id,
                ok,
            });
        } catch (error: unknown) {
            logError(`[WS] ${event}:res`, {
                socket_id: client.id,
                user_id: client?.user?.id,
                error,
            });
        }
    }

    afterInit() {
        logInfo('✅ Socket server initialized');
    }

    async handleConnection(socket: SocketData) {
        try {
            await this.authGuard.use(socket, (err: unknown) => {
                if (err) {
                    const payload = socketError('Authentication failed.');
                    socket.emit('unauthorized', payload);
                    socket.disconnect(true);
                    return;
                }
                logInfo(`User connected ${socket.id}`);
            });
        } catch (error: unknown) {
            logError('Connection Error', error);
            socket.emit('error', { message: 'Authentication failed.' });
        }
    }

    @SubscribeMessage('healthCheck')
    async helthCheck(@ConnectedSocket() client: SocketData) {
        try {
            logInfo(`Socket healthCheck ${client.id}`);
            client.emit('healthCheck', { message: 'ok' });
            this.logRes('healthCheck', client, { message: 'ok' });
        } catch (error: unknown) {
            logError('Connection Error', error);
            client.emit('healthCheck', error);
        }
    }

    @SubscribeMessage('checkUserIsOnline')
    async checkUserIsOnline(
        @ConnectedSocket() client: SocketData,
        user_id: number
    ) {
        try {
            const res = await this.connect.checkUserIsOnline({ user_id });
            client.emit('checkUserIsOnline', res);
            this.logRes('checkUserIsOnline', client, res);
        } catch (error) {
            logError('checkUserIsOnline Error', error);
            client.emit('checkUserIsOnline', error);
        }
    }

    @SubscribeMessage('setSocketId')
    async setSocket(@ConnectedSocket() client: SocketData) {
        try {
            const { id, token } = client.user;

            const setSocket = await this.connect.setSocketId({
                token: token,
                user_id: id,
                socket_id: client.id,
            });

            await client.join(`user_${id}`);
            client.emit('setSocketId', setSocket);
        } catch (error) {
            logError('setSocketId Error', error);
            client.emit('setSocketId', error);
        }
    }
}
