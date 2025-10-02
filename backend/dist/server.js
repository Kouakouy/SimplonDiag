"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = require("./setup/routes");
const initDemoUsers_1 = require("./scripts/initDemoUsers");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api', routes_1.router);
const port = parseInt(process.env.PORT || '3001', 10);
app.listen(port, async () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
    // Initialiser les utilisateurs de démonstration
    await (0, initDemoUsers_1.initializeDemoUsers)();
});
