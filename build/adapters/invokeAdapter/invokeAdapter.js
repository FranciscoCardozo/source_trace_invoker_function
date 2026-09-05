"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const analysisRequestValidator_1 = __importDefault(require("../../domain/analysisRequestValidator"));
const analysisPort_1 = __importDefault(require("../../ports/AnalysisPort/analysisPort"));
const debug = (0, debug_1.default)('invoke:adapter');
class InvokeAdapter {
    static async invokeAnalysisSource(req, res) {
        try {
            const { body } = req;
            debug('Init to invoke analysis source with body: %o', body);
            const validation = analysisRequestValidator_1.default.validate(body);
            if (!validation.valid || !validation.message) {
                debug('Invalid analysis request: %o', validation.errors);
                res.status(400).json({ message: 'Invalid analysis request', errors: validation.errors });
                return;
            }
            const execution = await analysisPort_1.default.startAnalysis(validation.message);
            debug('Analysis source started. analysisId: %s, executionArn: %s', validation.message.analysisId, execution.executionArn);
            res.status(202).json({
                analysisId: validation.message.analysisId,
                executionArn: execution.executionArn,
                startDate: execution.startDate,
                status: 'STARTED',
            });
        }
        catch (error) {
            debug('Error invoking analysis source: %o', error);
            res.status(500).json({
                message: 'Error invoking analysis source',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
exports.default = InvokeAdapter;
//# sourceMappingURL=invokeAdapter.js.map