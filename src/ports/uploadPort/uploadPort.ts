import debugLib from 'debug';
import { randomUUID } from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../../config';
import { UploadTicket } from '../../domain/models/uploadTicket.interface';

const debug = debugLib('upload:port');

export interface CreateUploadUrlInput {
    fileName: string;
    contentType: string;
    projectId: string | null;
}

/**
 * Genera una URL prefirmada (PUT) para que el front suba el artefacto
 * directamente a S3, sin que el archivo pase por la Lambda.
 */
export default class UploadPort {
    private static client = new S3Client({ region: config.AWS_REGION });

    public static async createUploadUrl(input: CreateUploadUrlInput): Promise<UploadTicket> {
        const bucket = config.S3.UPLOAD_BUCKET;
        if (!bucket) {
            throw new Error('La variable de entorno UPLOAD_BUCKET no está configurada.');
        }

        const uploadId = randomUUID();
        const key = UploadPort.buildKey(uploadId, input.fileName, input.projectId);
        const expiresIn = config.S3.UPLOAD_URL_EXPIRES_SECONDS;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: input.contentType,
        });

        debug('Presign PUT s3://%s/%s (expiresIn=%d)', bucket, key, expiresIn);
        const url = await getSignedUrl(UploadPort.client, command, { expiresIn });

        return {
            uploadId,
            bucket,
            key,
            artifactPath: `s3://${bucket}/${key}`,
            method: 'PUT',
            url,
            // El front debe mandar exactamente este header o la firma no coincide.
            headers: { 'Content-Type': input.contentType },
            expiresIn,
        };
    }

    /** uploads[/<projectId>]/<yyyy>/<mm>/<dd>/<uploadId>/<fileName> */
    private static buildKey(uploadId: string, fileName: string, projectId: string | null): string {
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(now.getUTCDate()).padStart(2, '0');
        const segments = [config.S3.UPLOAD_PREFIX];
        if (projectId) {
            segments.push(projectId.replace(/[^A-Za-z0-9._-]/g, '_'));
        }
        segments.push(String(yyyy), mm, dd, uploadId, fileName);
        return segments.join('/');
    }
}
