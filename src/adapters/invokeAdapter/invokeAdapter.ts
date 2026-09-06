import { Request, Response } from "express";
import debugLib from 'debug';
import AnalysisRequestValidator from "../../domain/analysisRequestValidator";
import AnalysisPort from "../../ports/AnalysisPort/analysisPort";
import JobPort from "../../ports/jobPort/jobPort";

const debug = debugLib('invoker:InvokeAdapter');

export default class InvokeAdapter {
    public static async invokeAnalysisSource(req: Request, res: Response): Promise<void> {
        try {
            const { body } = req;
            debug('Init to invoke analysis source with body: %o', body);

            const validation = AnalysisRequestValidator.validate(body);
            if (!validation.valid || !validation.message) {
                debug('Invalid analysis request: %o', validation.errors);
                res.status(400).json({ message: 'Invalid analysis request', errors: validation.errors });
                return;
            }

            const { jobId } = validation.message;

            // Pre-crea el item JOB#<jobId> (status QUEUED) antes de arrancar la ejecución.
            await JobPort.createQueuedJob(jobId);
            const execution = await AnalysisPort.startAnalysis(validation.message);
            debug('Analysis source started. jobId: %s, executionArn: %s', jobId, execution.executionArn);

            res.status(202).json({
                analysisId: jobId,
                status: 'STARTED',
            });
        } catch (error) {
            debug('Error invoking analysis source: %o', error);
            res.status(500).json({
                message: 'Error invoking analysis source',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

}
