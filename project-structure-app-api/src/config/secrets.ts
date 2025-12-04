import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { performance } from 'perf_hooks';
import { logData, logError, logInfo } from 'src/utils/logger';

export interface AppSecrets {
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOSTNAME: string;
}

let cachedSecrets: AppSecrets | null = null;
let isInitialized = false;

export const initializeSecrets = async (): Promise<void> => {
    if (isInitialized && cachedSecrets !== null) {
        logInfo('Secrets already initialized, skipping...');
        return;
    }

    const start = performance.now();

    try {
        if (!process.env.SECRET_NAME || !process.env.REGION) {
            logInfo(
                'Running without AWS Secrets Manager – falling back to local env vars'
            );
            const secrets = {
                DB_USERNAME: process.env.DB_USERNAME || '',
                DB_PASSWORD: process.env.DB_PASSWORD || '',
                DB_HOSTNAME: process.env.DB_HOSTNAME || '',
            } as AppSecrets;

            cachedSecrets = secrets;
            isInitialized = true;
            return;
        }

        const client = new SecretsManagerClient({ region: process.env.REGION });
        const command = new GetSecretValueCommand({
            SecretId: process.env.SECRET_NAME,
        });

        logInfo('Fetching all secrets from AWS Secrets Manager...');
        const response = await client.send(command);

        if (!response.SecretString) {
            throw new Error('Secret string is empty');
        }

        const secrets = JSON.parse(response.SecretString) as AppSecrets;

        if (!secrets.DB_USERNAME) {
            throw new Error('DB_USERNAME not found in secrets');
        }
        if (!secrets.DB_PASSWORD) {
            throw new Error('DB_PASSWORD not found in secrets');
        }
        if (!secrets.DB_HOSTNAME) {
            throw new Error('DB_HOSTNAME not found in secrets');
        }

        cachedSecrets = secrets;
        isInitialized = true;
        logInfo('✅ All secrets fetched from Secrets Manager');
    } catch (error) {
        logError('❌ Error initializing secrets:', error);
        throw new Error('Failed to initialize secrets');
    } finally {
        const end = performance.now();
        logInfo(`initializeSecrets took: ${end - start} ms`);
    }
};

export const getSecret = (key: keyof AppSecrets): string => {
    if (!isInitialized || cachedSecrets === null) {
        throw new Error(
            'Secrets not initialized. Call initializeSecrets() first.'
        );
    }
    return cachedSecrets[key];
};

export const getAllSecrets = (): AppSecrets => {
    if (!isInitialized || cachedSecrets === null) {
        throw new Error(
            'Secrets not initialized. Call initializeSecrets() first.'
        );
    }
    return { ...cachedSecrets };
};

export const areSecretsInitialized = (): boolean => {
    logData(
        'Check Secrets in cache ?',
        isInitialized && cachedSecrets !== null
    );
    return isInitialized && cachedSecrets !== null;
};

export const clearSecretsCache = (): void => {
    cachedSecrets = null;
    isInitialized = false;
    logInfo('Secrets cache cleared');
};
