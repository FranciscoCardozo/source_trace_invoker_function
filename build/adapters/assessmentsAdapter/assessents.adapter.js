"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const utils_1 = __importDefault(require("../../domain/utils"));
const crypto_1 = require("crypto");
const dynamo_service_1 = __importDefault(require("../../ports/services/dynamo.service"));
const debug = (0, debug_1.default)('assessments:adapter');
class AssessmentsAdapter {
    static async getAssessmentById(req, res) {
        try {
            const id = req.params.id;
            debug('Init to get assessment by ID: ', req.params.id);
            const keys = utils_1.default.validateParamas(id, 'ASSESSMENT');
            const assessment = (await dynamo_service_1.default.getItems(keys)).Items;
            debug('GetAssessmentById Rs: ', assessment);
            res.status(200).json({ assessment });
        }
        catch (error) {
            debug('Error getting assessment by ID: ', error);
            res.status(500).send({ message: 'Error getting assessment by ID', error });
        }
    }
    static async registryAssessment(req, res) {
        try {
            debug('Init to registry assessment');
            const body = req.body;
            const keys = utils_1.default.validateParamas((0, crypto_1.randomUUID)(), 'ASSESSMENT');
            const result = await dynamo_service_1.default.setItem(keys, body);
            res.status(200).json({ result });
        }
        catch (error) {
            debug('Error registry assessment: ', error);
            res.status(500).send({ message: 'Error registry assessment', error });
        }
    }
}
exports.default = AssessmentsAdapter;
//# sourceMappingURL=assessents.adapter.js.map