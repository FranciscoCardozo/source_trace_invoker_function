import debugLib from 'debug';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import config from '../../config';
import { AnalysisMessage } from '../../domain/models/analysisRequest.interface';
import { AnalysisExecution } from '../../domain/models/analysisExecution.interface';

const debug = debugLib('invoke:analysisPort');

/**
 * Inicia directamente la ejecución de la Step Function de análisis de código fuente.
 * El objeto `message` se envía como input (JSON) de la ejecución.
 */
export default class AnalysisPort {
    private static client = new SFNClient({ region: config.AWS_REGION });

    public static async startAnalysis(message: AnalysisMessage): Promise<AnalysisExecution> {
        const stateMachineArn = config.STEP_FUNCTION.ANALYSIS_STATE_MACHINE_ARN;
        if (!stateMachineArn) {
            throw new Error('La variable de entorno ANALYSIS_STATE_MACHINE_ARN no está configurada.');
        }

        debug('Start analysis %s on %s', message.jobId, stateMachineArn);
        const result = await AnalysisPort.client.send(
            new StartExecutionCommand({
                stateMachineArn,
                // Nombre único de ejecución; garantiza idempotencia durante ~90 días.
                name: message.jobId,
                input: JSON.stringify(message),
            }),
        );
        debug('Started analysis %s. executionArn: %s', message.jobId, result.executionArn);

        return { executionArn: result.executionArn, startDate: result.startDate };
    }
}
