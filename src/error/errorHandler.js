"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorMessage_1 = __importDefault(require("./errorMessage"));
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    if (err instanceof mongoose_1.default.Error.CastError) {
        const message = `Could not find item with id of ${err.value}!`;
        error = new errorMessage_1.default(message, 404);
    }
    if (err.code === 11000) {
        const message = `Duplicate field value entered!`;
        error = new errorMessage_1.default(message, 400);
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const message = Object.values(err.errors).map((element) => element.message).join(', ');
        error = new errorMessage_1.default(message, 422);
    }
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
};
exports.default = errorHandler;
