import { pgEnum } from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', ['user', 'admin']);
export const socialPlatformEnum = pgEnum('social_platform', [
    'google',
    'facebook',
    'apple',
]);
export const deviceTypeEnum = pgEnum('device_type', ['ios', 'android', 'web']);
export const contentTypeEnum = pgEnum('content_type', [
    'terms_and_condition',
    'privacy_policy',
    'about',
]);
export const appUpdateStatusEnum = pgEnum('app_update_status', [
    'is_force_update',
    'is_not_need',
]);
export const appPlatformEnum = pgEnum('app_platform', ['ios', 'android']);
export const notiForEnum = pgEnum('noti_for', ['test']);
export const albumTypeEnum = pgEnum('album_type', ['image', 'video']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'media']);

export const bankAccountStatusTypeEnum = pgEnum('bank_account_status', [
    'not_added',
    'restricted',
    'restricted_soon',
    'enabled',
    'complete',
    'rejected',
]);

export const statusEnum = pgEnum('status', [
    'success',
    'credited',
    'refunded',
    'cancelled',
    'pending',
]);
