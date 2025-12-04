import * as jwt from 'jsonwebtoken';
import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { db } from '../../database/connection';
import { users, userSessions } from 'project-structure-database';
import { and, eq } from 'drizzle-orm';
import { logError } from '../../utils/logger';

interface AuthenticatedUser {
    id: number;
}

interface AuthenticatedSocket extends Socket {
    data: {
        user: AuthenticatedUser;
    };
}

@Injectable()
export class SocketAuthGuard {
    private readonly logger = new Logger(SocketAuthGuard.name);
    constructor() {}

    async use(
        socket: AuthenticatedSocket,
        next: (err?: Error) => void
    ): Promise<void> {
        try {
            const bearerHeader: string = String(
                socket.handshake.headers['authorization'] || ''
            );
            if (!bearerHeader)
                return next(
                    new Error('A token is required for authentication.')
                );

            const bearerToken: string = bearerHeader.startsWith('Bearer ')
                ? bearerHeader.split(' ')[1] || ''
                : bearerHeader || '';

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

            if (!findUserSession)
                return next(new Error('Authentication failed.'));

            let payload: { id: string };
            try {
                const secret = process.env.TOKEN_KEY as string;
                const issuer = process.env.TOKEN_ISSUER;
                const audience = process.env.TOKEN_AUDIENCE;
                payload = jwt.verify(bearerToken, secret, {
                    issuer,
                    audience,
                }) as { id: string };
            } catch (err) {
                logError('SocketAuthGuard', err);
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
            if (!user) return next(new Error('Authentication failed.'));
            if (user.is_blocked_by_admin) {
                return next(
                    new Error('Your account has been blocked by the admin.')
                );
            }

            socket.data = { user };

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
