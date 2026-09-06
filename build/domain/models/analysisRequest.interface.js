"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactFormat = exports.SOURCE_TYPE_WIRE = exports.PayloadSourceType = exports.SourceType = void 0;
var SourceType;
(function (SourceType) {
    /** El repositorio se clona más adelante dentro del ECS. */
    SourceType["GIT"] = "GIT";
    /** El archivo ya fue subido manualmente y guardado en un storage accesible por el ECS. */
    SourceType["UPLOAD"] = "UPLOAD";
})(SourceType || (exports.SourceType = SourceType = {}));
/** Valor que el contenedor `analysis-mngr` espera en `payload.type` / `payload.jobType`. */
var PayloadSourceType;
(function (PayloadSourceType) {
    PayloadSourceType["GIT"] = "git";
    PayloadSourceType["S3"] = "s3";
})(PayloadSourceType || (exports.PayloadSourceType = PayloadSourceType = {}));
exports.SOURCE_TYPE_WIRE = {
    [SourceType.GIT]: PayloadSourceType.GIT,
    [SourceType.UPLOAD]: PayloadSourceType.S3,
};
var ArtifactFormat;
(function (ArtifactFormat) {
    ArtifactFormat["ZIP"] = "zip";
    ArtifactFormat["TAR_GZ"] = "tar.gz";
})(ArtifactFormat || (exports.ArtifactFormat = ArtifactFormat = {}));
//# sourceMappingURL=analysisRequest.interface.js.map