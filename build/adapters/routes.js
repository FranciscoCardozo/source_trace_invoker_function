"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invokeAdapter_1 = __importDefault(require("./invokeAdapter/invokeAdapter"));
const uploadAdapter_1 = __importDefault(require("./uploadAdapter/uploadAdapter"));
const router = (0, express_1.Router)();
router.post("/V1/product/analysis/invoke", async (req, res) => {
    return await invokeAdapter_1.default.invokeAnalysisSource(req, res);
});
router.get("/V1/product/analysis/uploadUrl", async (req, res) => {
    return await uploadAdapter_1.default.uploadAnalysisSource(req, res);
});
exports.default = router;
//# sourceMappingURL=routes.js.map