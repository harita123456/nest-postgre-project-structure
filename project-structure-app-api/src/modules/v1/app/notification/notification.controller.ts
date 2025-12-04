import {
    Controller,
    Post,
    Body,
    Res,
    HttpCode,
    Get,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from '../../../../notification/notification.service';
import {
    successRes,
    errorRes,
    internalErrorRes,
} from '../../../../common/responses.common';
import { translate } from '../../../../i18n/i18n.util';
import { logError } from '../../../../utils/logger';
import type { ApiResponse as ApiResponseType } from '../../../../common/responses.common';
import {
    TestNotificationDto,
    NotificationListQueryDto,
} from './dto/notification.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../../../../common/guards/role.guard';
import { db } from '../../../../database/connection';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { Notification, notifications } from 'project-structure-database';
import { AuthRequest } from '../../../../common/types';

@ApiTags('App Notification')
@Controller('app/v1/notification')
export class NotificationController {
    constructor(
        private readonly notifications: NotificationService,
        private readonly i18n: I18nService
    ) {}

    @HttpCode(200)
    @Post('test')
    @ApiBody({ type: TestNotificationDto })
    async testNotification(
        @Body() body: TestNotificationDto,
        @Res() res: Response
    ): Promise<ApiResponseType<null>> {
        try {
            const tokens = (body.tokens || '')
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            if (tokens.length === 0) {
                return errorRes(
                    res,
                    translate(this.i18n, 'DEVICE_TOKENS_REQUIRED')
                );
            }

            await this.notifications.multiNotificationSend(tokens, {
                noti_title: body.title ?? 'Test Notification',
                noti_msg: body.message ?? 'This is a test push notification',
                noti_for: 'test',
                id: 0,
                noti_image: body.noti_image,
                sound_name: body.sound_name,
                details: body.details,
            });

            return successRes(
                res,
                translate(this.i18n, 'NOTIFICATION_SENT'),
                null
            );
        } catch (error: unknown) {
            logError('TEST_NOTIFICATION_ERROR', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, UserOnlyGuard)
    @Get('unread-count')
    async unreadCount(
        @Req() req: AuthRequest,
        @Res() res: Response
    ): Promise<ApiResponseType<{ count: number } | null>> {
        try {
            const userId = req.user.id;

            const [row] = await db
                .select({
                    count: sql<number>`COUNT(*)`,
                })
                .from(notifications)
                .where(
                    and(
                        or(
                            eq(notifications.receiver_id, userId),
                            sql<boolean>`${userId} = ANY(${notifications.receiver_ids})`
                        ),
                        or(
                            sql<boolean>`${notifications.read_by_user} IS NULL`,
                            sql<boolean>`NOT (${userId} = ANY(${notifications.read_by_user}))`
                        )
                    )
                );

            return successRes(
                res,
                translate(this.i18n, 'UNREAD_NOTIFICATION_COUNT'),
                {
                    count: Number(row?.count ?? 0),
                }
            );
        } catch (error: unknown) {
            logError('unreadCount', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, UserOnlyGuard)
    @Get('list')
    async list(
        @Query() query: NotificationListQueryDto,
        @Req() req: AuthRequest,
        @Res() res: Response
    ): Promise<ApiResponseType<{ items: Notification[] } | null>> {
        try {
            const userId = req.user.id;
            const page = Math.max(Number(query.page ?? 1) || 1, 1);
            const limit = Math.min(
                Math.max(Number(query.limit ?? 20) || 20, 1),
                100
            );
            const offset = (page - 1) * limit;

            await db
                .update(notifications)
                .set({
                    read_by_user: sql`CASE WHEN ${userId} = ANY(${notifications.read_by_user}) THEN ${notifications.read_by_user} ELSE array_append(COALESCE(${notifications.read_by_user}, '{}'), ${userId}) END`,
                })
                .where(
                    and(
                        or(
                            eq(notifications.receiver_id, userId),
                            sql<boolean>`${userId} = ANY(${notifications.receiver_ids})`
                        ),
                        or(
                            sql<boolean>`${notifications.read_by_user} IS NULL`,
                            sql<boolean>`NOT (${userId} = ANY(${notifications.read_by_user}))`
                        )
                    )
                );

            const items = await db
                .select()
                .from(notifications)
                .where(
                    or(
                        eq(notifications.receiver_id, userId),
                        sql<boolean>`${userId} = ANY(${notifications.receiver_ids})`
                    )
                )
                .orderBy(desc(notifications.id))
                .limit(limit)
                .offset(offset);

            return successRes(res, translate(this.i18n, 'NOTIFICATION_LIST'), {
                items,
            });
        } catch (error: unknown) {
            logError('notificationList', error);
            return internalErrorRes(
                translate(this.i18n, 'INTERNAL_SERVER_ERROR'),
                error
            );
        }
    }
}
