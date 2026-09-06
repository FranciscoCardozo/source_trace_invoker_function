import { randomUUID } from 'crypto';
import config from '../config';
import {
    AnalysisMessage,
    AnalysisPayload,
    AnalysisRequestBody,
    AnalysisValidationResult,
    ArtifactFormat,
    SourceType,
} from './models/analysisRequest.interface';

const GIT_URL_REGEX = /^(https?:\/\/|git@|ssh:\/\/|git:\/\/).+/i;

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida el cuerpo HTTP y lo normaliza al input que recibe la Step Function.
 * Los modos GIT y UPLOAD son mutuamente excluyentes.
 */
export default class AnalysisRequestValidator {
    public static validate(body: AnalysisRequestBody | undefined | null): AnalysisValidationResult {
        const errors: string[] = [];

        if (!body || typeof body !== 'object') {
            return { valid: false, errors: ['El cuerpo de la petición es requerido y debe ser un objeto JSON.'] };
        }

        const sourceType = body.sourceType;
        if (!isNonEmptyString(sourceType) || !Object.values(SourceType).includes(sourceType as SourceType)) {
            errors.push(`El campo "sourceType" es requerido y debe ser uno de: ${Object.values(SourceType).join(', ')}.`);
        }

        const hasRepo = isNonEmptyString(body.repoUrl);
        const hasArtifact = isNonEmptyString(body.artifactPath);

        if (hasRepo && hasArtifact) {
            errors.push('No se puede enviar "repoUrl" y "artifactPath" a la vez; elige un solo origen.');
        }

        let artifactFormat: ArtifactFormat | null = null;

        if (sourceType === SourceType.GIT) {
            if (!hasRepo) {
                errors.push('Para "sourceType": "GIT" el campo "repoUrl" es requerido.');
            } else if (!GIT_URL_REGEX.test(body.repoUrl!.trim())) {
                errors.push('El campo "repoUrl" no tiene un formato de URL de repositorio válido.');
            }
        }

        if (sourceType === SourceType.UPLOAD) {
            if (!hasArtifact) {
                errors.push('Para "sourceType": "UPLOAD" el campo "artifactPath" es requerido.');
            }
            const rawFormat = isNonEmptyString(body.artifactFormat)
                ? body.artifactFormat.trim().toLowerCase()
                : ArtifactFormat.ZIP;
            if (!Object.values(ArtifactFormat).includes(rawFormat as ArtifactFormat)) {
                errors.push(`El campo "artifactFormat" debe ser uno de: ${Object.values(ArtifactFormat).join(', ')}.`);
            } else {
                artifactFormat = rawFormat as ArtifactFormat;
            }
        }

        if (isNonEmptyString(body.callbackUrl) && !/^https?:\/\//i.test(body.callbackUrl.trim())) {
            errors.push('El campo "callbackUrl" debe ser una URL http(s).');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        const payload: AnalysisPayload = {
            schemaVersion: config.ANALYSIS_SCHEMA_VERSION,
            requestedAt: new Date().toISOString(),
            sourceType: sourceType as SourceType,
        };

        if (sourceType === SourceType.GIT) {
            payload.repoUrl = body.repoUrl!.trim();
            if (isNonEmptyString(body.branch)) payload.branch = body.branch.trim();
            if (isNonEmptyString(body.commit)) payload.commit = body.commit.trim();
        }
        if (sourceType === SourceType.UPLOAD) {
            payload.artifactPath = body.artifactPath!.trim();
            if (artifactFormat) payload.artifactFormat = artifactFormat;
        }
        if (isNonEmptyString(body.authTokenRef)) payload.authTokenRef = body.authTokenRef.trim();
        if (isNonEmptyString(body.projectId)) payload.projectId = body.projectId.trim();
        if (isNonEmptyString(body.callbackUrl)) payload.callbackUrl = body.callbackUrl.trim();

        const message: AnalysisMessage = { jobId: randomUUID(), payload };

        return { valid: true, errors: [], message };
    }
}
