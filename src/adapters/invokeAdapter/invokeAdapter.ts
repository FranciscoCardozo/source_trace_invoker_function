import { Request, Response } from "express";
import debugLib from 'debug';
import AnalysisRequestValidator from "../../domain/analysisRequestValidator";
import AnalysisPort from "../../ports/AnalysisPort/analysisPort";

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

            const execution = await AnalysisPort.startAnalysis(validation.message);
            debug('Analysis source started. analysisId: %s, executionArn: %s', validation.message.analysisId, execution.executionArn);

            res.status(202).json({
                analysisId: validation.message.analysisId,
                executionArn: execution.executionArn,
                startDate: execution.startDate,
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
