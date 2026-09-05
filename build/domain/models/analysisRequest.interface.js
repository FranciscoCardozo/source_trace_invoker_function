"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactFormat = exports.SourceType = void 0;
var SourceType;
(function (SourceType) {
    /** El repositorio se clona más adelante dentro del ECS. */
    SourceType["GIT"] = "GIT";
    /** El archivo ya fue subido manualmente y guardado en un storage accesible por el ECS. */
    SourceType["UPLOAD"] = "UPLOAD";
})(SourceType || (exports.SourceType = SourceType = {}));
var ArtifactFormat;
(function (ArtifactFormat) {
    ArtifactFormat["ZIP"] = "zip";
    ArtifactFormat["TAR_GZ"] = "tar.gz";
})(ArtifactFormat || (exports.ArtifactFormat = ArtifactFormat = {}));
//# sourceMappingURL=analysisRequest.interface.js.map