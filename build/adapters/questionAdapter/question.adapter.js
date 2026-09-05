"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const dynamo_service_1 = __importDefault(require("../../ports/services/dynamo.service"));
const crypto_1 = require("crypto");
const utils_1 = __importDefault(require("../../domain/utils"));
const debug = (0, debug_1.default)('question:adapter');
class QuestionAdapter {
    static async getAllQuestions(req, res) {
        try {
            debug('Init to get all questions');
            const id = req.params.id;
            const params = utils_1.default.validateParamas(id, 'QUESTION');
            const questions = (await dynamo_service_1.default.getItems({ ...params })).Items;
            debug('GetAllQuestions RS: ', questions);
            res.status(200).json({ questions });
        }
        catch (error) {
            debug('Error getting questions: ', error);
            res.status(500).send({ message: 'Error getting questions', error });
        }
    }
    static async registryQuestion(req, res) {
        try {
            debug('Init to registry question');
            const body = req.body;
            const keys = utils_1.default.validateParamas((0, crypto_1.randomUUID)(), 'QUESTION');
            const result = await dynamo_service_1.default.setItem(keys, body);
            res.status(200).json({ result });
        }
        catch (error) {
            debug('Error registry question: ', error);
            res.status(500).send({ message: 'Error registry question', error });
        }
    }
}
exports.default = QuestionAdapter;
//# sourceMappingURL=question.adapter.js.map