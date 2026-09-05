export enum SourceType {
    /** El repositorio se clona más adelante dentro del ECS. */
    GIT = 'GIT',
    /** El archivo ya fue subido manualmente y guardado en un storage accesible por el ECS. */
    UPLOAD = 'UPLOAD',
}

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

/** Origen normalizado que viaja dentro del mensaje. */
export interface AnalysisSource {
    type: SourceType;
    repoUrl: string | null;
    branch: string | null;
    commit: string | null;
    authTokenRef: string | null;
    artifactPath: string | null;
    artifactFormat: ArtifactFormat | null;
}

/** Payload usado como input de la Step Function. */
export interface AnalysisMessage {
    analysisId: string;
    schemaVersion: string;
    requestedAt: string;
    source: AnalysisSource;
    projectId: string | null;
    callbackUrl: string | null;
}

export interface AnalysisValidationResult {
    valid: boolean;
    errors: string[];
    message?: AnalysisMessage;
}
