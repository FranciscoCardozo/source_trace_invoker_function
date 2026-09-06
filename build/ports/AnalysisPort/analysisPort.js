"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const client_sfn_1 = require("@aws-sdk/client-sfn");
const config_1 = __importDefault(require("../../config"));
const debug = (0, debug_1.default)('invoke:analysisPort');
/**
 * Inicia directamente la ejecución de la Step Function de análisis de código fuente.
 * El objeto `message` se envía como input (JSON) de la ejecución.
 */
class AnalysisPort {
    static async startAnalysis(message) {
        const stateMachineArn = config_1.default.STEP_FUNCTION.ANALYSIS_STATE_MACHINE_ARN;
        if (!stateMachineArn) {
            throw new Error('La variable de entorno ANALYSIS_STATE_MACHINE_ARN no está configurada.');
        }
        debug('Start analysis %s on %s', message.jobId, stateMachineArn);
        const result = await AnalysisPort.client.send(new client_sfn_1.StartExecutionCommand({
            stateMachineArn,
            // Nombre único de ejecución; garantiza idempotencia durante ~90 días.
            name: message.jobId,
            input: JSON.stringify(message),
        }));
        debug('Started analysis %s. executionArn: %s', message.jobId, result.executionArn);
        return { executionArn: result.executionArn, startDate: result.startDate };
    }
}
AnalysisPort.client = new client_sfn_1.SFNClient({ region: config_1.default.AWS_REGION });
exports.default = AnalysisPort;
//# sourceMappingURL=analysisPort.js.map