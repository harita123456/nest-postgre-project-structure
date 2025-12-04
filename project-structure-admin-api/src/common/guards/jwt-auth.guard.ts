import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { db } from '../../database/connection';
import { eq, and } from 'drizzle-orm';
import { users, User, userSessions } from 'project-structure-database';
import * as Sentry from '@sentry/nestjs';
import { logError } from 'src/utils/logger';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor() {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        interface RequestWithUser extends Request {
            user?: User & { token?: string };
        }
        const req = ctx.switchToHttp().getRequest<RequestWithUser>();

        const authHeader: string = String(req.headers['authorization'] ?? '');
        if (!authHeader)
            throw new UnauthorizedException(
                'A token is required for authentication.'
            );

        const [, token] = authHeader.split(' ');
        if (!token) throw new UnauthorizedException('Authentication failed.');

        const [session] = await db
            .select()
            .from(userSessions)
            .where(
                and(
                    eq(userSessions.auth_token, token),
                    eq(userSessions.is_deleted, false)
                )
            )
            .limit(1);
        if (!session) throw new UnauthorizedException('Authentication failed.');

        let payload: { id: number };
        try {
            const secret = process.env.TOKEN_KEY as string;
            const issuer = process.env.TOKEN_ISSUER;
            const audience = process.env.TOKEN_AUDIENCE;
            payload = jwt.verify(token, secret, {
                issuer,
                audience,
            }) as { id: number };
        } catch (err: unknown) {
            logError('Error:   ', err);
            throw new UnauthorizedException(`Authentication failed.`);
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
        if (!user) throw new UnauthorizedException('Authentication failed.');
        if (user.is_blocked_by_admin)
            throw new ForbiddenException(
                'Your account has been blocked by the admin.'
            );
        req.user = user;
        req.user.token = token;

        const id = user?.id;
        const email = user?.email_address;
        Sentry.setUser({ id: String(id), email });
        Sentry.setContext('user', { id, email });
        Sentry.setTags({
            source: 'auth',
            'user.id': String(id),
            'user.email': String(email),
        });

        return true;
    }
}
