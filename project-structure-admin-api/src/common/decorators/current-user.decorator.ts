import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'project-structure-database';

interface RequestWithUser extends Request {
    user?: User;
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): User | undefined => {
        const req = ctx.switchToHttp().getRequest<RequestWithUser>();
        return req.user;
    }
);
