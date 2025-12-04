import bcrypt from 'bcryptjs';

export function securePassword(password: string): string {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

export function comparePassword(password: string, dbPassword: string): boolean {
    try {
        return bcrypt.compareSync(password, dbPassword);
    } catch {
        return false;
    }
}
