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
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = require("./setup/routes");
const initDemoUsers_1 = require("./scripts/initDemoUsers");
const app = (0, express_1.default)();
// Faire confiance au proxy (nécessaire sur Render/Heroku pour X-Forwarded-For)
app.set('trust proxy', 1);
// CORS: Autoriser toutes les origines et gérer les preflights avant tout
const corsOptions = {
    origin: true, // reflète l'origine de la requête
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
// Sécurité: Headers HTTP sécurisés
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// Sécurité: Rate limiting global
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite de 100 requêtes par IP
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
});
// Sécurité: Rate limiting strict pour l'authentification
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    skipSuccessfulRequests: true,
    skip: (req) => req.method === 'OPTIONS',
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
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
