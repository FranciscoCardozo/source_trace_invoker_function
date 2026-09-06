"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const uploadRequestValidator_1 = __importDefault(require("../../domain/uploadRequestValidator"));
const uploadPort_1 = __importDefault(require("../../ports/uploadPort/uploadPort"));
const debug = (0, debug_1.default)('invoker:UploadAdapter');
class UploadAdapter {
    /**
     * GET: devuelve una URL prefirmada de S3 (SOURCE_TRACE_API) para que el
     * front suba el artefacto directamente al bucket.
     */
    static async uploadAnalysisSource(req, res) {
        try {
            debug('Init to build upload ticket with query: %o', req.query);
            const validation = uploadRequestValidator_1.default.validate(req.query);
            if (!validation.valid || !validation.value) {
                debug('Invalid upload request: %o', validation.errors);
                res.status(400).json({ message: 'Invalid upload request', errors: validation.errors });
                return;
            }
            const ticket = await uploadPort_1.default.createUploadUrl(validation.value);
            debug('Upload ticket created. uploadId: %s, key: %s', ticket.uploadId, ticket.key);
            res.status(200).json(ticket);
        }
        catch (error) {
            debug('Error building upload ticket: %o', error);
            res.status(500).json({
                message: 'Error building upload ticket',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
exports.default = UploadAdapter;
//# sourceMappingURL=uploadAdapter.js.map