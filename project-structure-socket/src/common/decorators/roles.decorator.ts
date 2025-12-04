import { SetMetadata } from '@nestjs/common';
import { User } from 'project-structure-database';

export type UserType = User['user_type'];
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
