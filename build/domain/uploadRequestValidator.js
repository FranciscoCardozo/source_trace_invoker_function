"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
/** Content-types aceptados para el artefacto de código fuente. */
const ALLOWED_CONTENT_TYPES = new Set([
    'application/zip',
    'application/x-zip-compressed',
    'application/gzip',
    'application/x-gzip',
    'application/x-tar',
    'application/octet-stream',
]);
/** Extensiones aceptadas (comprimidos). */
const ALLOWED_EXTENSIONS = ['.zip', '.tar.gz', '.tgz'];
const MAX_FILENAME_LENGTH = 200;
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
/**
 * Deja solo el nombre base y caracteres seguros, evitando path traversal
 * y keys de S3 problemáticas.
 */
function sanitizeFileName(raw) {
    const base = raw.trim().replace(/\\/g, '/').split('/').pop() || '';
    return base.replace(/[^A-Za-z0-9._-]/g, '_');
}
class UploadRequestValidator {
    static validate(query) {
        const errors = [];
        if (!query || typeof query !== 'object') {
            return { valid: false, errors: ['Faltan los query params de la petición.'] };
        }
        if (!isNonEmptyString(query.fileName)) {
            return { valid: false, errors: ['El query param "fileName" es requerido.'] };
        }
        const fileName = sanitizeFileName(query.fileName);
        if (!fileName || fileName === '.' || fileName === '..') {
            errors.push('El "fileName" no es válido.');
        }
        if (fileName.length > MAX_FILENAME_LENGTH) {
            errors.push(`El "fileName" supera los ${MAX_FILENAME_LENGTH} caracteres.`);
        }
        const lowerName = fileName.toLowerCase();
        if (!ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
            errors.push(`El "fileName" debe terminar en: ${ALLOWED_EXTENSIONS.join(', ')}.`);
        }
        const contentType = isNonEmptyString(query.contentType)
            ? query.contentType.trim().toLowerCase()
            : DEFAULT_CONTENT_TYPE;
        if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
            errors.push(`El "contentType" debe ser uno de: ${[...ALLOWED_CONTENT_TYPES].join(', ')}.`);
        }
        if (errors.length > 0) {
            return { valid: false, errors };
        }
        return {
            valid: true,
            errors: [],
            value: {
                fileName,
                contentType,
                projectId: isNonEmptyString(query.projectId) ? query.projectId.trim() : null,
            },
        };
    }
}
exports.default = UploadRequestValidator;
//# sourceMappingURL=uploadRequestValidator.js.map