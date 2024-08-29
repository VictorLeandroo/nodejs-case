"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfirmMeasureData = exports.checkExistingMeasure = exports.validateImageData = void 0;
const database_1 = __importDefault(require("../config/database"));
const validateImageData = (image, customer_code, measure_datetime, measure_type) => {
    if (!image || typeof image !== 'string' || !/^data:image\/(png|jpeg|jpg);base64,/.test(image)) {
        return 'O campo "image" deve ser uma string base64 de uma imagem.';
    }
    if (!customer_code || typeof customer_code !== 'string') {
        return 'O campo "customer_code" deve ser uma string.';
    }
    if (!measure_datetime || isNaN(Date.parse(measure_datetime))) {
        return 'O campo "measure_datetime" deve ser uma data válida.';
    }
    const validMeasureTypes = ['WATER', 'GAS'];
    if (!measure_type || !validMeasureTypes.includes(measure_type.toUpperCase())) {
        return 'O campo "measure_type" deve ser "WATER" ou "GAS".';
    }
    return null;
};
exports.validateImageData = validateImageData;
const checkExistingMeasure = (customer_code, measure_type, measure_datetime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield database_1.default.query('SELECT * FROM measures WHERE customer_code = ? AND measure_type = ? AND YEAR(measure_datetime) = YEAR(?) AND MONTH(measure_datetime) = MONTH(?)', [customer_code, measure_type, measure_datetime, measure_datetime]);
        return Array.isArray(results) && results.length > 0;
    }
    catch (error) {
        throw error;
    }
});
exports.checkExistingMeasure = checkExistingMeasure;
const validateConfirmMeasureData = (measure_uuid, confirmed_value) => {
    if (!measure_uuid || typeof measure_uuid !== 'string') {
        return 'O campo "measure_uuid" deve ser uma string.';
    }
    if (confirmed_value == null || typeof confirmed_value !== 'number') {
        return 'O campo "confirmed_value" deve ser um número.';
    }
    return null;
};
exports.validateConfirmMeasureData = validateConfirmMeasureData;
