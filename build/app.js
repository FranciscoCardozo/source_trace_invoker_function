"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // NOSONAR
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./adapters/routes"));
const app = (0, express_1.default)();
app.disable('x-powered-by');
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../static')));
app.use((req, res, next) => {
    console.log(`Petición recibida: ${req.method} ${req.originalUrl}`);
    next();
});
app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // NOSONAR
    res.header('Access-Control-Allow-Headers', '*'); // NOSONAR
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE'); // NOSONAR
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use(routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map