"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const crypto_1 = require("crypto");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const config_1 = __importDefault(require("../../config"));
const debug = (0, debug_1.default)('upload:port');
/**
 * Genera una URL prefirmada (PUT) para que el front suba el artefacto
 * directamente a S3, sin que el archivo pase por la Lambda.
 */
class UploadPort {
    static async createUploadUrl(input) {
        const bucket = config_1.default.S3.UPLOAD_BUCKET;
        if (!bucket) {
            throw new Error('La variable de entorno UPLOAD_BUCKET no está configurada.');
        }
        const uploadId = (0, crypto_1.randomUUID)();
        const key = UploadPort.buildKey(uploadId, input.fileName, input.projectId);
        const expiresIn = config_1.default.S3.UPLOAD_URL_EXPIRES_SECONDS;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: input.contentType,
        });
        debug('Presign PUT s3://%s/%s (expiresIn=%d)', bucket, key, expiresIn);
        const url = await (0, s3_request_presigner_1.getSignedUrl)(UploadPort.client, command, { expiresIn });
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
    static buildKey(uploadId, fileName, projectId) {
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(now.getUTCDate()).padStart(2, '0');
        const segments = [config_1.default.S3.UPLOAD_PREFIX];
        if (projectId) {
            segments.push(projectId.replace(/[^A-Za-z0-9._-]/g, '_'));
        }
        segments.push(String(yyyy), mm, dd, uploadId, fileName);
        return segments.join('/');
    }
}
UploadPort.client = new client_s3_1.S3Client({ region: config_1.default.AWS_REGION });
exports.default = UploadPort;
//# sourceMappingURL=uploadPort.js.map