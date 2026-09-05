"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static validateParamas(id, pk) {
        return {
            PK: pk,
            ...(id && { SK: `${pk}#${id}` })
        };
    }
}
exports.default = Utils;
//# sourceMappingURL=utils.js.map