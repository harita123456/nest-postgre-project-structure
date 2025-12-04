import {
    S3Client,
    PutObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logData, logError } from './logger';

const s3Client = new S3Client({ region: process.env.REGION });

const DEFAULT_TTL = 300; // 5 minutes
const SIGNED_URL_TTL_SECONDS = Math.max(
    1,
    Number(process.env.S3_SIGNED_URL_TTL_SECONDS ?? DEFAULT_TTL)
);

export interface S3UrlResponse {
    uploadUrl: string;
    filePath: string;
    expiresIn: number;
}

export interface S3DownloadResponse {
    downloadUrl: string;
    filePath: string;
    expiresIn: number;
}

/* ----------------  Upload URL  ---------------- */
export async function generateUploadURL(
    filePath: string,
    fileType: string
): Promise<S3UrlResponse> {
    const bucket = process.env.BUCKET_NAME;
    if (!bucket) throw new Error('BUCKET_NAME is not configured');

    const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: filePath,
        ContentType: fileType,
    };
    logData(params, 'generateUploadURL');

    try {
        const command = new PutObjectCommand(params);
        const expiresIn = SIGNED_URL_TTL_SECONDS;
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

        return { uploadUrl, filePath, expiresIn };
    } catch (err: unknown) {
        logError('failed to generate S3 upload URL', err);
        throw err instanceof Error
            ? err
            : new Error('Failed to generate upload URL');
    }
}

/* ----------------  Download URL  ---------------- */
export async function generateDownloadURL(
    filePath: string
): Promise<S3DownloadResponse> {
    const bucket = process.env.BUCKET_NAME;
    if (!bucket) throw new Error('BUCKET_NAME is not configured');

    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: filePath });
        const expiresIn = SIGNED_URL_TTL_SECONDS;
        const downloadUrl = await getSignedUrl(s3Client, command, {
            expiresIn,
        });

        return { downloadUrl, filePath, expiresIn };
    } catch (err: unknown) {
        logError('failed to generate S3 download URL', err);
        throw err instanceof Error
            ? err
            : new Error('Failed to generate download URL');
    }
}

/* ----------------  Delete  ---------------- */
export async function deleteObject(key: string) {
    try {
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: key,
            })
        );
        logData({ key }, 'deleteObject');
    } catch (err: unknown) {
        logError('Error deleting file', err);
        throw err instanceof Error ? err : new Error('Failed to delete file');
    }
}

export {
    s3Client,
    PutObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    type PutObjectCommandInput,
};
