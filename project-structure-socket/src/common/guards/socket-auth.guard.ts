import * as jwt from 'jsonwebtoken';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { db } from '../../database/connection';
import { users, userSessions } from 'project-structure-database';
import { and, eq } from 'drizzle-orm';
import { logError } from '../../utils/logger';
import { User } from 'project-structure-database';
import * as Sentry from '@sentry/nestjs';
import { socketError } from '../../common/socket-response';

interface AuthenticatedSocket extends Socket {
    user: User & { token: string };
}

@Injectable()
export class SocketAuthGuard implements CanActivate {
    private readonly logger = new Logger(SocketAuthGuard.name);
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context
                .switchToWs()
                .getClient<AuthenticatedSocket>();

            const auth = client.handshake?.auth as
                | Record<string, unknown>
                | undefined;
            const rawAuthToken =
                typeof auth?.['token'] === 'string' ? auth['token'] : '';
            const headerAuth: string = String(
                client.handshake.headers['authorization'] || ''
            );
            const tokenSource = rawAuthToken || headerAuth;
            if (!tokenSource) {
                client.emit(
                    'unauthorized',
                    socketError('Authentication failed.')
                );
                client.disconnect(true);
                return false;
            }

            const bearerToken: string = tokenSource.startsWith('Bearer ')
                ? tokenSource.split(' ')[1] || ''
                : tokenSource;

            const [findUserSession] = await db
                .select()
                .from(userSessions)
                .where(
                    and(
                        eq(userSessions.auth_token, bearerToken),
                        eq(userSessions.is_deleted, false)
                    )
                )
                .limit(1);
            if (!findUserSession) {
                client.emit(
                    'unauthorized',
                    socketError('Authentication failed.')
                );
                client.disconnect(true);
                return false;
            }

            let payload: { id: number };
            try {
                const secret = process.env.TOKEN_KEY as string;
                const issuer = process.env.TOKEN_ISSUER;
                const audience = process.env.TOKEN_AUDIENCE;
                payload = jwt.verify(bearerToken, secret, {
                    issuer,
                    audience,
                }) as { id: number };
            } catch (err) {
                logError('SocketAuthGuard.canActivate', err);
                client.emit(
                    'unauthorized',
                    socketError('Authentication failed.')
                );
                client.disconnect(true);
                return false;
            }

            const [user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.id, Number(payload.id)),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);
            if (!user) {
                client.emit(
                    'unauthorized',
                    socketError('Authentication failed.')
                );
                client.disconnect(true);
                return false;
            }
            if (user.is_blocked_by_admin) {
                client.emit(
                    'unauthorized',
                    socketError('Your account has been blocked by the admin.')
                );
                client.disconnect(true);
                return false;
            }

            client['user'] = { ...user, token: bearerToken };
            return true;
        } catch (error: unknown) {
            this.logger.error(
                `SocketAuthGuard.canActivate error: ${(error as Error)?.message || ''}`
            );
            return false;
        }
    }

    async use(
        socket: AuthenticatedSocket,
        next: (err?: Error) => void
    ): Promise<void> {
        try {
            const auth = socket.handshake?.auth as
                | Record<string, unknown>
                | undefined;
            const rawAuthToken =
                typeof auth?.['token'] === 'string' ? auth['token'] : '';
            const headerAuth: string = String(
                socket.handshake.headers['authorization'] || ''
            );
            const tokenSource = rawAuthToken || headerAuth;
            if (!tokenSource) {
                socket.emit(
                    'unauthorized',
                    socketError('A token is required for authentication.')
                );
                socket.disconnect(true);
                return next(
                    new Error('A token is required for authentication.')
                );
            }

            const bearerToken: string = tokenSource.startsWith('Bearer ')
                ? tokenSource.split(' ')[1] || ''
                : tokenSource;

            const [findUserSession] = await db
                .select()
                .from(userSessions)
                .where(
                    and(
                        eq(userSessions.auth_token, bearerToken),
                        eq(userSessions.is_deleted, false)
                    )
                )
                .limit(1);

            if (!findUserSession) {
                socket.emit(
                    'unauthorized',
                    socketError('Authentication failed.')
                );
                socket.disconnect(true);
                return next(new Error('Authentication failed.'));
            }

            let payload: { id: number };
            try {
                const secret = process.env.TOKEN_KEY as string;
                const issuer = process.env.TOKEN_ISSUER;
                const audience = process.env.TOKEN_AUDIENCE;
                payload = jwt.verify(bearerToken, secret, {
                    issuer,
                    audience,
                }) as { id: number };
            } catch (err) {
                logError('SocketAuthGuard', err);
                socket.emit(
                    'unauthorized',
                    socketError('Authentication failed.')
                );
                socket.disconnect(true);
                return next(new Error('Authentication failed.'));
            }

            const [user] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.id, Number(payload.id)),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);
            if (!user) {
                socket.emit(
                    'unauthorized',
                    socketError('Authentication failed.')
                );
                socket.disconnect(true);
                return next(new Error('Authentication failed.'));
            }
            if (user.is_blocked_by_admin) {
                socket.emit(
                    'forbidden',
                    socketError('Your account has been blocked by the admin.')
                );
                socket.disconnect(true);
                return next(
                    new Error('Your account has been blocked by the admin.')
                );
            }

            socket['user'] = { ...user, token: bearerToken };

            const id = user?.id;
            const email = user?.email_address;
            Sentry.setUser({ id: String(id), email });
            Sentry.setContext('user', { id, email });
            Sentry.setTags({
                source: 'auth',
                'user.id': String(id),
                'user.email': String(email),
            });

            return next();
        } catch (error: unknown) {
            this.logger.error(
                `SocketAuth middleware error: ${(error as Error)?.message || ''}`
            );
            return next(new Error('Authentication failed.'));
        }
    }
}

export const socketAuth = (guardInstance: SocketAuthGuard) =>
    guardInstance.use.bind(guardInstance);
