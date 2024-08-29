"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const measureRoutes_1 = __importDefault(require("./routes/measureRoutes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const app = (0, express_1.default)();
app.use('/api/measures', measureRoutes_1.default);
app.use(errorHandler_1.default);
exports.default = app;
