import { and, eq } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import { UserSession, userSessions } from 'project-structure-database';

export async function findSessionBySocketId(
    socketId: string
): Promise<UserSession | null> {
    const [row] = await db
        .select()
        .from(userSessions)
        .where(
            and(
                eq(userSessions.socket_id, socketId),
                eq(userSessions.is_deleted, false)
            )
        )
        .limit(1);
    return row ?? null;
}

export async function findActiveSessionsByUserId(
    userId: number
): Promise<UserSession[]> {
    return db
        .select()
        .from(userSessions)
        .where(
            and(
                eq(userSessions.user_id, userId),
                eq(userSessions.is_active, true),
                eq(userSessions.is_deleted, false)
            )
        );
}

export async function updateSessionById(
    id: number,
    data: Partial<UserSession>
): Promise<UserSession | null> {
    const [row] = await db
        .update(userSessions)
        .set(data)
        .where(eq(userSessions.id, id))
        .returning();
    return row ?? null;
}

export async function updateSessionByUserAndToken(
    user_id: number,
    token: string,
    data: Partial<UserSession>
): Promise<UserSession | null> {
    const [row] = await db
        .update(userSessions)
        .set(data)
        .where(
            and(
                eq(userSessions.user_id, user_id),
                eq(userSessions.auth_token, token),
                eq(userSessions.is_deleted, false)
            )
        )
        .returning();
    return row ?? null;
}
