export enum SourceType {
    /** El repositorio se clona más adelante dentro del ECS. */
    GIT = 'GIT',
    /** El archivo ya fue subido manualmente y guardado en un storage accesible por el ECS. */
    UPLOAD = 'UPLOAD',
}

/** Valor que el contenedor `analysis-mngr` espera en `payload.type` / `payload.jobType`. */
export enum PayloadSourceType {
    GIT = 'git',
    S3 = 's3',
}

export const SOURCE_TYPE_WIRE: Record<SourceType, PayloadSourceType> = {
    [SourceType.GIT]: PayloadSourceType.GIT,
    [SourceType.UPLOAD]: PayloadSourceType.S3,
};

export enum ArtifactFormat {
    ZIP = 'zip',
    TAR_GZ = 'tar.gz',
}

/** Cuerpo HTTP crudo que recibe la Lambda invocadora. */
export interface AnalysisRequestBody {
    sourceType?: string;
    // Modo GIT
    repoUrl?: string;
    branch?: string;
    commit?: string;
    /** Referencia a un secreto (p. ej. secretsmanager:my/token) para repos privados. */
    authTokenRef?: string;
    // Modo UPLOAD
    /** Ruta del artefacto ya guardado: s3://bucket/key o una ruta de volumen del ECS. */
    artifactPath?: string;
    artifactFormat?: string;
    // Comunes
    projectId?: string;
    callbackUrl?: string;
}

/**
 * `AnalysisRequest` validado y normalizado. Viaja como `$.payload` en el input
 * de la Step Function; el Step Function no lo inspecta, lo parsea el contenedor
 * `getSource` (env `PAYLOAD`). Las claves ausentes se omiten (no van en `null`).
 */
export interface AnalysisPayload {
    schemaVersion: string;
    requestedAt: string;
    /**
     * `git` | `s3`. Todos son el mismo valor: la state machine lee `$.payload.sourceType`
     * y el contenedor `analysis-mngr` valida `type` / `jobType`.
     */
    type: PayloadSourceType;
    jobType: PayloadSourceType;
    sourceType: PayloadSourceType;
    repoUrl?: string;
    branch?: string;
    commit?: string;
    authTokenRef?: string;
    artifactPath?: string;
    artifactFormat?: ArtifactFormat;
    projectId?: string;
    callbackUrl?: string;
}

/**
 * Input de la Step Function.
 * `$.jobId` → PK `JOB#<jobId>` en DynamoDB y env `JOB_ID` de cada task ECS.
 * `$.payload` → objeto JSON (obligatorio; `{}` es válido) que se pasa como env `PAYLOAD`.
 */
export interface AnalysisMessage {
    jobId: string;
    payload: AnalysisPayload;
}

export interface AnalysisValidationResult {
    valid: boolean;
    errors: string[];
    message?: AnalysisMessage;
}
