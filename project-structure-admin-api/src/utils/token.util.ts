import * as jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';

const TOKEN_SECRET = process.env.TOKEN_KEY as string;
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN ?? '1h';
const TOKEN_ISSUER = process.env.TOKEN_ISSUER ?? 'project-structure-admin-api';
const TOKEN_AUDIENCE =
    process.env.TOKEN_AUDIENCE ?? 'project-structure-admin-app';
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);

export const userToken = (id: number): string => {
    if (!TOKEN_SECRET) {
        throw new Error('TOKEN_KEY environment variable is not set');
    }
    return jwt.sign(
        { id },
        TOKEN_SECRET as jwt.Secret,
        {
            expiresIn: TOKEN_EXPIRES_IN,
            issuer: TOKEN_ISSUER,
            audience: TOKEN_AUDIENCE,
        } as jwt.SignOptions
    );
};

export function generateRefreshToken(): { token: string; expiresAt: Date } {
    const token = randomBytes(48).toString('hex');
    const expiresAt = getRefreshExpiryDate();
    return { token, expiresAt };
}

export function hashTokenSha256(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function getRefreshExpiryDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS);
    return d;
}
