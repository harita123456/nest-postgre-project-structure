import { Injectable } from '@nestjs/common';
import { db } from '../../../../database/connection';
import { users, User } from 'project-structure-database';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { escapeRegex } from '../../../../common/regex.common';
import {
    ServiceResponse,
    serviceError,
    serviceSuccess,
    serviceSuccessPagination,
    servicecatch,
} from '../../../../common/service-response';
import { ListUsersDto, blockUnblockUserDto } from './dto/users.dto';
import { logError } from '../../../../utils/logger';
import { generateDownloadURL } from '../../../../utils/aws-s3.util';

type UserListItem = Pick<
    User,
    | 'id'
    | 'first_name'
    | 'last_name'
    | 'user_name'
    | 'email_address'
    | 'mobile_number'
    | 'user_type'
    | 'created_at'
    | 'updated_at'
>;

@Injectable()
export class UsersService {
    constructor() {}

    async listUsers(
        dto: ListUsersDto
    ): Promise<ServiceResponse<UserListItem[] | []>> {
        try {
            const { search = '', page = 1, limit = 10 } = dto;

            const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
            const safePage = Math.max(1, Number(page) || 1);
            const offset = (safePage - 1) * safeLimit;

            const conditions = [
                eq(users.is_deleted, false),
                eq(users.user_type, 'user'),
            ];

            const escapedSearch = search ? escapeRegex(search) : null;
            if (escapedSearch) {
                const searchParts = escapedSearch.split(' ').filter(Boolean);

                if (searchParts.length === 1) {
                    conditions.push(
                        or(
                            ilike(users.first_name, `%${searchParts[0]}%`),
                            ilike(users.last_name, `%${searchParts[0]}%`),
                            ilike(users.user_name, `%${escapedSearch}%`),
                            ilike(users.email_address, `%${escapedSearch}%`)
                        ) as SQL<unknown>
                    );
                } else if (searchParts.length >= 2) {
                    const firstNamePart = searchParts[0];
                    const lastNamePart = searchParts.slice(1).join(' ');

                    conditions.push(
                        and(
                            ilike(users.first_name, `%${firstNamePart}%`),
                            ilike(users.last_name, `%${lastNamePart}%`)
                        ) as SQL<unknown>
                    );
                }
            }

            const whereClause = and(...conditions) as SQL<unknown>;

            const rows = await db
                .select({
                    id: users.id,
                    first_name: users.first_name,
                    last_name: users.last_name,
                    user_name: users.user_name,
                    email_address: users.email_address,
                    mobile_number: users.mobile_number,
                    user_type: users.user_type,
                    created_at: users.created_at,
                    is_blocked_by_admin: users.is_blocked_by_admin,
                    updated_at: users.updated_at,
                    profile_picture: users.profile_picture,
                    profile_url: users.profile_url,
                })
                .from(users)
                .where(whereClause)
                .orderBy(desc(users.created_at))
                .limit(safeLimit)
                .offset(offset);

            const usersWithUrls = await Promise.all(
                rows.map(async (user) => ({
                    ...user,
                    profile_picture:
                        user.profile_picture &&
                        user.profile_picture.trim() !== null
                            ? (await generateDownloadURL(user.profile_picture))
                                  .downloadUrl
                            : null,
                }))
            );

            const [countRow] = await db
                .select({ total: sql<number>`count(*)` })
                .from(users)
                .where(whereClause);

            const total = Number(countRow?.total ?? 0);

            return serviceSuccessPagination('USERS_LIST', usersWithUrls, total);
        } catch (error) {
            logError('listUsers', error);
            return servicecatch('listUsers', error);
        }
    }

    async userDetails(user_id: number): Promise<ServiceResponse<User | null>> {
        try {
            const [userRow] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.id, user_id),
                        eq(users.user_type, 'user'),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!userRow) {
                return serviceError('USER_NOT_FOUND');
            }

            const profilePictureUrl =
                userRow.profile_picture &&
                userRow.profile_picture.trim() !== null
                    ? (await generateDownloadURL(userRow.profile_picture))
                          .downloadUrl
                    : null;

            userRow.profile_picture = profilePictureUrl;

            const sanitized = {
                ...userRow,
                password: null,
            };
            return serviceSuccess('USER_DETAILS', sanitized);
        } catch (error) {
            logError('userDetails', error);
            return servicecatch('userDetails', error);
        }
    }

    async blockUnblockUser(
        dto: blockUnblockUserDto
    ): Promise<ServiceResponse<User | null>> {
        try {
            const [userRow] = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.id, dto.user_id),
                        eq(users.user_type, 'user'),
                        eq(users.is_deleted, false)
                    )
                )
                .limit(1);

            if (!userRow) {
                return serviceError('USER_NOT_FOUND');
            }

            if (userRow.is_blocked_by_admin === dto.is_blocked_by_admin) {
                const message = dto.is_blocked_by_admin
                    ? 'USER_ALREADY_BLOCKED'
                    : 'USER_ALREADY_UNBLOCKED';
                return serviceError(message);
            }

            const [updatedUser] = await db
                .update(users)
                .set({
                    is_blocked_by_admin: dto.is_blocked_by_admin,
                    updated_at: new Date(),
                })
                .where(
                    and(
                        eq(users.id, dto.user_id),
                        eq(users.user_type, 'user'),
                        eq(users.is_deleted, false)
                    )
                )
                .returning();

            if (!updatedUser) {
                return serviceError('USER_UPDATE_FAILED');
            }

            const message = updatedUser.is_blocked_by_admin
                ? 'USER_BLOCKED'
                : 'USER_UNBLOCKED';

            // if (updatedUser.is_blocked_by_admin) {
            //     await db
            //         .delete(userSessions)
            //         .where(eq(userSessions.user_id, dto.user_id));
            // }

            return serviceSuccess(message, updatedUser);
        } catch (error) {
            logError('blockUnblockUser', error);
            return servicecatch('blockUnblockUser', error);
        }
    }
}
