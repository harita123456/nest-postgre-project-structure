import { performance } from 'perf_hooks';

export interface AppSecrets {
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_HOSTNAME: string;
    TOKEN_KEY: string;
}

let cachedSecrets: AppSecrets | null = null;
let isInitialized = false;

export const initializeSecrets = async (): Promise<void> => {
    if (isInitialized && cachedSecrets !== null) {
        console.log("Secrets already initialized, skipping...");
        return;
    }

    const start = performance.now();

    try {
        const secrets: Partial<AppSecrets> = {
            DB_USERNAME: process.env.DB_USERNAME,
            DB_PASSWORD: process.env.DB_PASSWORD,
            DB_NAME: process.env.DB_NAME,
            DB_HOSTNAME: process.env.DB_HOSTNAME,
            TOKEN_KEY: process.env.TOKEN_KEY,
        };

        const missing: string[] = [];
        for (const key of ["DB_USERNAME", "DB_PASSWORD", "DB_NAME", "DB_HOSTNAME", "TOKEN_KEY"]) {
            const k = key as keyof AppSecrets;
            if (!secrets[k]) missing.push(key);
        }

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
        }

        cachedSecrets = secrets as AppSecrets;
        isInitialized = true;
        console.log("✅ All secrets loaded from environment variables");
    } catch (error) {
        console.error("❌ Error initializing secrets:", error);
        throw new Error("Failed to initialize secrets");
    } finally {
        const end = performance.now();
        console.log(`initializeSecrets took: ${end - start} ms`);
    }
};

export const getSecret = (key: keyof AppSecrets): string => {
    if (!isInitialized || cachedSecrets === null) {
        throw new Error("Secrets not initialized. Call initializeSecrets() first.");
    }
    return cachedSecrets[key];
};

export const getAllSecrets = (): AppSecrets => {
    if (!isInitialized || cachedSecrets === null) {
        throw new Error("Secrets not initialized. Call initializeSecrets() first.");
    }
    return { ...cachedSecrets };
};

export const areSecretsInitialized = (): boolean => {
    console.log("Check Secrets in cache ?", isInitialized && cachedSecrets !== null);
    return isInitialized && cachedSecrets !== null;
};

export const clearSecretsCache = (): void => {
    cachedSecrets = null;
    isInitialized = false;
    console.log("Secrets cache cleared");
};
