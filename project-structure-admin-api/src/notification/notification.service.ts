import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { logData, logError } from '../utils/logger';

interface NotifyBase {
    noti_title: string;
    noti_msg: string;
    noti_for: string;
    review_id?: number;
    id: number;
    chat_room_id?: string;
    sender_id?: string;
    noti_image?: string;
    sound_name?: string;
    details?: unknown;
    device_token?: string[];
    pet_id?: number;
}

@Injectable()
export class NotificationService {
    private projectId: string;
    private readonly logger = new Logger(NotificationService.name);
    private firebaseClientEmail!: string;
    private firebasePrivateKey!: string;

    constructor() {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (privateKey && privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn(
                'Firebase env credentials are not fully configured; notifications may not work.'
            );
            this.projectId = projectId || '';
            return;
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        }

        this.firebaseClientEmail = clientEmail;
        this.firebasePrivateKey = privateKey;
        this.projectId = projectId;
    }

    private async getAccessToken(): Promise<string> {
        if (!this.firebaseClientEmail || !this.firebasePrivateKey) {
            throw new Error(
                'Firebase credentials are not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
            );
        }
        const jwtClient = new google.auth.JWT({
            email: this.firebaseClientEmail,
            key: this.firebasePrivateKey,
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        const { access_token } = await jwtClient.authorize();
        return access_token as string;
    }

    async subscribeToTopic(deviceTokens: string[], topic: string) {
        try {
            const res = await admin
                .messaging()
                .subscribeToTopic(deviceTokens, topic);
            return { success: true, count: res.successCount };
        } catch (e: unknown) {
            return {
                success: false,
                error: e instanceof Error ? e.message : String(e),
            };
        }
    }

    async unsubscribeFromTopic(deviceTokens: string[], topic: string) {
        try {
            const res = await admin
                .messaging()
                .unsubscribeFromTopic(deviceTokens, topic);
            return { success: true, count: res.successCount };
        } catch (e: unknown) {
            return {
                success: false,
                error: e instanceof Error ? e.message : String(e),
            };
        }
    }

    async singleNotificationSend(
        deviceToken: string,
        payload: NotifyBase
    ): Promise<void> {
        const accessToken = await this.getAccessToken();
        const {
            noti_title,
            noti_msg,
            noti_for,
            id,
            noti_image,
            details,
            sound_name,
        } = payload;

        const messageBody: Record<string, unknown> = {
            title: noti_title,
            body: noti_msg,
            noti_for: noti_for,
            id: id,
            sound: sound_name + '.caf',
        };

        if (details !== undefined) {
            messageBody.details = details;
        }

        const noti_payload: Record<string, unknown> = {
            title: noti_title,
            body: noti_msg,
        };

        if (noti_image !== undefined) {
            noti_payload.image = noti_image;
        }

        const message: Record<string, unknown> = {
            message: {
                token: deviceToken,
                notification: noti_payload,
                data: messageBody,
            },
        };

        try {
            await axios.post(
                'https://fcm.googleapis.com/v1/projects/' +
                    this.projectId +
                    '/messages:send',
                message,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            logData('Notification sent successfully', message);
        } catch (error: unknown) {
            logError('Error sending notification', error);
        }
    }

    async multiNotificationSend(
        deviceTokenData: string[],
        payload: NotifyBase & { chat_room_id?: string; sender_id?: string }
    ): Promise<void> {
        const {
            noti_title,
            noti_msg,
            noti_for,
            noti_image,
            chat_room_id,
            sender_id,
            sound_name,
        } = payload;

        const accessToken = await this.getAccessToken();

        const topic =
            Math.floor(1000 + Math.random() * 8999) +
            '_' +
            Date.now().toString();

        if (Array.isArray(deviceTokenData) && deviceTokenData.length > 0) {
            const subscribeResult = await this.subscribeToTopic(
                deviceTokenData,
                topic
            );
            if (!subscribeResult.success) {
                logError('Subscription failed', subscribeResult.error);
                return;
            }

            const messageBody: Record<string, string> = {
                title: String(noti_title ?? ''),
                body: String(noti_msg ?? ''),
                noti_for: String(noti_for ?? ''),
            };
            if (chat_room_id) {
                messageBody.chat_room_id = chat_room_id;
            }
            if (sender_id) {
                messageBody.sender_id = sender_id;
            }

            const noti_payload: Record<string, unknown> = {
                title: noti_title,
                body: noti_msg,
                image: noti_image,
            };

            const message: Record<string, unknown> = {
                message: {
                    topic: topic,
                    notification: noti_payload,
                    data: messageBody,
                    android: {
                        notification: {
                            sound:
                                sound_name &&
                                sound_name.toLowerCase() !== 'none'
                                    ? sound_name.toLowerCase() === 'default'
                                        ? 'default'
                                        : `${sound_name}`
                                    : undefined,
                            channel_id:
                                sound_name &&
                                sound_name.toLowerCase() !== 'none'
                                    ? `${sound_name}`
                                    : undefined,
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: sound_name
                                    ? sound_name.toLowerCase() === 'none'
                                        ? undefined
                                        : `${sound_name}.caf`
                                    : 'default',
                            },
                        },
                    },
                },
            };

            try {
                await axios.post(
                    `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`,
                    message,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                logData('NOTIFICATION_SENT_SUCCESS', topic);
            } catch (error: unknown) {
                logError('NOTIFICATION_SEND_ERROR', error);
            }

            const unsubscribeResult = await this.unsubscribeFromTopic(
                deviceTokenData,
                topic
            );
            if (!unsubscribeResult.success) {
                logError('UNSUBSCRIPTION_FAILED', unsubscribeResult.error);
                return;
            }

            logData('Notification sent and tokens unsubscribed');
        }
    }
}
