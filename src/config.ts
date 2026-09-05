export default {
    apiPath: process.env.API_PATH || '/Invoker',
    DEBUG: process.env.DEBUG || 'source_trace:*',
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME || 'source_trace_db',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    STEP_FUNCTION: {
        // ARN de la Step Function que ejecuta el análisis de código fuente.
        ANALYSIS_STATE_MACHINE_ARN: process.env.ANALYSIS_STATE_MACHINE_ARN || '',
    },
    S3: {
        // Bucket donde el front sube el artefacto con la URL prefirmada.
        UPLOAD_BUCKET: process.env.UPLOAD_BUCKET || '',
        // Prefijo (carpeta) bajo el que se guardan los archivos subidos.
        UPLOAD_PREFIX: process.env.UPLOAD_PREFIX || 'uploads',
        // Segundos de validez de la URL prefirmada.
        UPLOAD_URL_EXPIRES_SECONDS: Number(process.env.UPLOAD_URL_EXPIRES_SECONDS || 900),
    },
    // Versión del contrato del input que recibe la Step Function.
    ANALYSIS_SCHEMA_VERSION: '1.0',
}
