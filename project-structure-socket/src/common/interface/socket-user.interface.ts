import { User } from 'project-structure-database';
import { Socket } from 'socket.io';

export interface SocketData extends Socket {
    user: User & { token: string };
}
