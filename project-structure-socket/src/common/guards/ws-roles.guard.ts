import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserType } from '../decorators/roles.decorator';
import { SocketData } from '../interface/socket-user.interface';
import { socketError } from '../socket-response';

@Injectable()
export class WsRolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const client = context.switchToWs().getClient<SocketData>();
        const userType = client?.user?.user_type as UserType | undefined;
        if (!userType) {
            client.emit('forbidden', socketError('Forbidden'));
            client.disconnect(true);
            return false;
        }

        const ok = requiredRoles.includes(userType);
        if (!ok) {
            client.emit('forbidden', socketError('Forbidden'));
            client.disconnect(true);
            return false;
        }
        return true;
    }
}
