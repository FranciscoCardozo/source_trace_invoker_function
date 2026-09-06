import debugLib from 'debug';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import config from '../../config';

const debug = debugLib('invoker:JobPort');

/**
 * Escribe el item META del job en DynamoDB.
 * Pre-crear el item con estado `QUEUED` hace que un status query inmediato
 * (entre el StartExecution y el estado `MarkRunning` del Step Function) responda.
 */
export default class JobPort {
    private static doc = DynamoDBDocumentClient.from(
        new DynamoDBClient({ region: config.AWS_REGION }),
    );

    public static async createQueuedJob(jobId: string): Promise<void> {
        const table = config.DYNAMODB_TABLE_NAME;
        if (!table) {
            throw new Error('La variable de entorno DYNAMODB_TABLE no está configurada.');
        }

        debug('PutItem JOB#%s SK=META status=QUEUED en %s', jobId, table);
        await JobPort.doc.send(
            new PutCommand({
                TableName: table,
                Item: {
                    PK: `JOB#${jobId}`,
                    SK: 'META',
                    status: 'QUEUED',
                    createdAt: new Date().toISOString(),
                },
                // No pisar un item existente (mismo jobId ya en curso).
                ConditionExpression: 'attribute_not_exists(PK)',
            }),
        );
    }
}
