"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const routes_1 = require("../routes");
const reports_1 = __importDefault(require("../routes/reports"));
exports.router = (0, express_1.Router)();
exports.router.use('/auth', routes_1.authRouter); // authRouter pointe maintenant vers usersRouter
exports.router.use('/forms', routes_1.formsRouter);
exports.router.use('/public', routes_1.publicRouter);
exports.router.use('/reports', reports_1.default);
