import { RequestHandler, Request, Response } from 'express';
import { NextFunction } from 'express';
import * as Sentry from '@sentry/nestjs';
import { INestApplication } from '@nestjs/common';

function getRoutePath(req: Request): string {
    const routeContainer = (req as unknown as { route?: unknown }).route;
    if (routeContainer && typeof routeContainer === 'object') {
        const routeObj = routeContainer as Record<string, unknown>;
        const p = routeObj.path;
        if (typeof p === 'string') {
            return p;
        }
    }
    return req.path;
}

function redactHeaders(headers: Request['headers']): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(headers)) {
        const key = k.toLowerCase();
        if (
            key === 'authorization' ||
            key === 'cookie' ||
            key === 'set-cookie' ||
            key === 'x-api-key'
        ) {
            out[key] = '[redacted]';
        } else {
            out[key] = v as unknown;
        }
    }
    return out;
}

function extractUser(req: Request): { userId?: string; email?: string } {
    const userContainer = (req as unknown as { user?: unknown }).user;
    let userId: string | undefined;
    let email: string | undefined;
    if (userContainer && typeof userContainer === 'object') {
        const u = userContainer as Record<string, unknown>;
        const id = u.id;
        const em = u.email_address;
        if (typeof id === 'string' || typeof id === 'number') {
            userId = String(id);
        }
        if (typeof em === 'string') {
            email = em;
        }
    }

    const headerId = req.header('x-user-id');
    const headerEmail = req.header('x-email');
    if (!userId && typeof headerId === 'string') {
        userId = headerId;
    }
    if (!email && typeof headerEmail === 'string') {
        email = headerEmail;
    }
    return { userId, email };
}
export const sentryTracingMiddleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const routePath = getRoutePath(req);

    Sentry.startSpan(
        {
            op: 'http.server',
            name: `${req.method} ${routePath}`,
            forceTransaction: true,
            attributes: {
                'http.method': req.method,
                'http.url': req.url,
                'http.route': routePath,
                'http.target': req.originalUrl || req.url,
                'http.request.headers': JSON.stringify(
                    redactHeaders(req.headers)
                ),
                'http.request.query': JSON.stringify(req.query),
            },
        },
        (span) => {
            span?.setAttributes({
                'request.method': req.method,
                'request.url': req.url,
                'request.path': req.path,
            });

            res.on('finish', () => {
                span?.setAttributes({
                    'http.response.status_code': res.statusCode,
                });
                span?.setStatus({
                    code: res.statusCode >= 500 ? 2 : 1,
                    message: res.statusMessage || 'OK',
                });
            });

            next();
        }
    );
};

export const captureResponseBody: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const originalSend = res.send;
    const overrideSend = function (
        this: Response,
        body: JSON
    ): ReturnType<typeof res.send> {
        Sentry.addBreadcrumb({
            category: 'http',
            message: 'response',
            data: { statusCode: this.statusCode, data: body },
            level: 'debug',
        });
        {
            const { userId, email } = extractUser(req);
            if (userId || email) {
                Sentry.setUser({
                    id: String(userId ?? ''),
                    email: String(email ?? ''),
                });
                Sentry.setContext('app_user', {
                    id: String(userId ?? ''),
                    email: String(email ?? ''),
                });
            }
            Sentry.setContext('response', { statusCode: this.statusCode });
        }

        return originalSend.call(this, body);
    };

    res.send = overrideSend as unknown as typeof res.send;
    next();
};

export function setupExpressErrorHandler(app: INestApplication) {
    app.use(
        (err: unknown, _req: Request, res: Response, next: NextFunction) => {
            const error = err instanceof Error ? err : new Error(String(err));
            if (res.headersSent) {
                return next(error);
            }
            res.status(500).send('Something broke!');
            Sentry.captureException(error, {
                contexts: {
                    server: { name: 'error in server' },
                },
            });
        }
    );
}
