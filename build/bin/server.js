"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const port = Number(process.env.PORT) || 3001;
app_1.default.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
//# sourceMappingURL=server.js.map