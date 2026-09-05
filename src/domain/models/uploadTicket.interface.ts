/** Query params que recibe el GET de upload. */
export interface UploadRequestQuery {
    fileName?: string;
    contentType?: string;
    projectId?: string;
}

/**
 * Respuesta del GET: todo lo que el front necesita para hacer el PUT directo a S3
 * y, luego, para invocar el análisis con "sourceType": "UPLOAD".
 */
export interface UploadTicket {
    /** Identificador de esta subida (se reutiliza como carpeta en la key). */
    uploadId: string;
    bucket: string;
    key: string;
    /** Ruta lista para enviar como "artifactPath" al endpoint /invoke. */
    artifactPath: string;
    /** Método HTTP con el que el front debe subir el archivo. */
    method: 'PUT';
    /** URL prefirmada. */
    url: string;
    /** Headers que el front DEBE enviar en el PUT (deben coincidir con la firma). */
    headers: Record<string, string>;
    /** Segundos de validez de la URL. */
    expiresIn: number;
}

export interface UploadValidationResult {
    valid: boolean;
    errors: string[];
    value?: {
        fileName: string;
        contentType: string;
        projectId: string | null;
    };
}
