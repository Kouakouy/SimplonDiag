"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = exports.publicRouter = exports.formsRouter = exports.authRouter = void 0;
var auth_1 = require("./auth");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return auth_1.authRouter; } });
var forms_1 = require("./forms");
Object.defineProperty(exports, "formsRouter", { enumerable: true, get: function () { return forms_1.formsRouter; } });
var public_1 = require("./public");
Object.defineProperty(exports, "publicRouter", { enumerable: true, get: function () { return public_1.publicRouter; } });
var users_1 = require("./users");
Object.defineProperty(exports, "usersRouter", { enumerable: true, get: function () { return __importDefault(users_1).default; } });
