import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    Logger,
} from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { socketError } from '../socket-response';

@Catch()
export class WsExceptionFilter
    extends BaseWsExceptionFilter
    implements ExceptionFilter
{
    private readonly logger = new Logger(WsExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ws = host.switchToWs();
        const client = ws.getClient<Socket>();
        const pattern = ws.getPattern();

        if (!client) {
            return super.catch(exception, host);
        }

        let messageText = 'Internal server error';

        if (exception instanceof BadRequestException) {
            const resp = exception.getResponse();
            if (typeof resp === 'string') {
                messageText = resp;
            } else if (resp && typeof resp === 'object') {
                const msg = (resp as Record<string, unknown>).message;
                if (Array.isArray(msg)) {
                    messageText = msg.join(', ');
                } else if (typeof msg === 'string') {
                    messageText = msg;
                }
            } else {
                messageText = exception.message;
            }
        } else if (exception instanceof Error) {
            messageText = exception.message || messageText;
        }

        const payload = socketError(messageText, { error: exception });

        try {
            if (pattern) {
                client.emit(pattern, payload);
                client.emit('error', payload);
            } else {
                client.emit('error', payload);
            }
        } catch (emitErr) {
            const trace =
                emitErr instanceof Error ? emitErr.stack : String(emitErr);
            this.logger.error(
                `Failed to emit WS error for pattern ${String(pattern)}`,
                trace
            );
        }

        if (!(exception instanceof BadRequestException)) {
            const stack =
                exception instanceof Error ? exception.stack : undefined;
            this.logger.error(
                `WS Exception on pattern ${String(pattern)}: ${messageText}`,
                stack
            );
        } else {
            this.logger.debug(
                `WS Validation failed on pattern ${String(pattern)}: ${messageText}`
            );
        }
    }
}
