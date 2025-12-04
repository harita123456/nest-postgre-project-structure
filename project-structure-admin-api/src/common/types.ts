import { User } from 'project-structure-database';

export interface AuthRequest extends Request {
    user: User & { token: string };
}
