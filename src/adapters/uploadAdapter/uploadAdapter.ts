import { Request, Response } from "express";
import debugLib from 'debug';
import UploadRequestValidator from "../../domain/uploadRequestValidator";
import UploadPort from "../../ports/uploadPort/uploadPort";

const debug = debugLib('upload:adapter');

export default class UploadAdapter {
    /**
     * GET: devuelve una URL prefirmada de S3 (SOURCE_TRACE_API) para que el
     * front suba el artefacto directamente al bucket.
     */
    public static async uploadAnalysisSource(req: Request, res: Response): Promise<void> {
        try {
            debug('Init to build upload ticket with query: %o', req.query);

            const validation = UploadRequestValidator.validate(req.query);
            if (!validation.valid || !validation.value) {
                debug('Invalid upload request: %o', validation.errors);
                res.status(400).json({ message: 'Invalid upload request', errors: validation.errors });
                return;
            }

            const ticket = await UploadPort.createUploadUrl(validation.value);
            debug('Upload ticket created. uploadId: %s, key: %s', ticket.uploadId, ticket.key);

            res.status(200).json(ticket);
        } catch (error) {
            debug('Error building upload ticket: %o', error);
            res.status(500).json({
                message: 'Error building upload ticket',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
