import { and, eq } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import { users, User } from 'project-structure-database';

export async function findActiveUserById(userId: number): Promise<User | null> {
    const [row] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, userId), eq(users.is_deleted, false)))
        .limit(1);
    return row ?? null;
}

export async function updateUserById(
    id: number,
    data: Partial<User>
): Promise<User | null> {
    const [row] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
    return row ?? null;
}
