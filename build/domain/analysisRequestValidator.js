"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const config_1 = __importDefault(require("../config"));
const analysisRequest_interface_1 = require("./models/analysisRequest.interface");
const GIT_URL_REGEX = /^(https?:\/\/|git@|ssh:\/\/|git:\/\/).+/i;
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
/**
 * Valida el cuerpo HTTP y lo normaliza al input que recibe la Step Function.
 * Los modos GIT y UPLOAD son mutuamente excluyentes.
 */
class AnalysisRequestValidator {
    static validate(body) {
        const errors = [];
        if (!body || typeof body !== 'object') {
            return { valid: false, errors: ['El cuerpo de la petición es requerido y debe ser un objeto JSON.'] };
        }
        const sourceType = body.sourceType;
        if (!isNonEmptyString(sourceType) || !Object.values(analysisRequest_interface_1.SourceType).includes(sourceType)) {
            errors.push(`El campo "sourceType" es requerido y debe ser uno de: ${Object.values(analysisRequest_interface_1.SourceType).join(', ')}.`);
        }
        const hasRepo = isNonEmptyString(body.repoUrl);
        const hasArtifact = isNonEmptyString(body.artifactPath);
        if (hasRepo && hasArtifact) {
            errors.push('No se puede enviar "repoUrl" y "artifactPath" a la vez; elige un solo origen.');
        }
        let artifactFormat = null;
        if (sourceType === analysisRequest_interface_1.SourceType.GIT) {
            if (!hasRepo) {
                errors.push('Para "sourceType": "GIT" el campo "repoUrl" es requerido.');
            }
            else if (!GIT_URL_REGEX.test(body.repoUrl.trim())) {
                errors.push('El campo "repoUrl" no tiene un formato de URL de repositorio válido.');
            }
        }
        if (sourceType === analysisRequest_interface_1.SourceType.UPLOAD) {
            if (!hasArtifact) {
                errors.push('Para "sourceType": "UPLOAD" el campo "artifactPath" es requerido.');
            }
            const rawFormat = isNonEmptyString(body.artifactFormat)
                ? body.artifactFormat.trim().toLowerCase()
                : analysisRequest_interface_1.ArtifactFormat.ZIP;
            if (!Object.values(analysisRequest_interface_1.ArtifactFormat).includes(rawFormat)) {
                errors.push(`El campo "artifactFormat" debe ser uno de: ${Object.values(analysisRequest_interface_1.ArtifactFormat).join(', ')}.`);
            }
            else {
                artifactFormat = rawFormat;
            }
        }
        if (isNonEmptyString(body.callbackUrl) && !/^https?:\/\//i.test(body.callbackUrl.trim())) {
            errors.push('El campo "callbackUrl" debe ser una URL http(s).');
        }
        if (errors.length > 0) {
            return { valid: false, errors };
        }
        const payload = {
            schemaVersion: config_1.default.ANALYSIS_SCHEMA_VERSION,
            requestedAt: new Date().toISOString(),
            sourceType: sourceType,
        };
        if (sourceType === analysisRequest_interface_1.SourceType.GIT) {
            payload.repoUrl = body.repoUrl.trim();
            if (isNonEmptyString(body.branch))
                payload.branch = body.branch.trim();
            if (isNonEmptyString(body.commit))
                payload.commit = body.commit.trim();
        }
        if (sourceType === analysisRequest_interface_1.SourceType.UPLOAD) {
            payload.artifactPath = body.artifactPath.trim();
            if (artifactFormat)
                payload.artifactFormat = artifactFormat;
        }
        if (isNonEmptyString(body.authTokenRef))
            payload.authTokenRef = body.authTokenRef.trim();
        if (isNonEmptyString(body.projectId))
            payload.projectId = body.projectId.trim();
        if (isNonEmptyString(body.callbackUrl))
            payload.callbackUrl = body.callbackUrl.trim();
        const message = { jobId: (0, crypto_1.randomUUID)(), payload };
        return { valid: true, errors: [], message };
    }
}
exports.default = AnalysisRequestValidator;
//# sourceMappingURL=analysisRequestValidator.js.map