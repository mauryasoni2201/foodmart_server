"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.veriFyUserToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorMessage_1 = __importDefault(require("../error/errorMessage"));
const generateToken = (id, role) => {
    if (process.env.JWT_SECRET && process.env.JWT_EXPIRE) {
        const token = jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        return token;
    }
};
exports.generateToken = generateToken;
const veriFyUserToken = (req, res, next) => {
    let token;
    const headers = req.headers.authorization;
    if (headers && headers.startsWith('Bearer')) {
        token = headers.split(' ')[1];
    }
    if (!token) {
        return next(new errorMessage_1.default('Token is required.', 400));
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return next(new errorMessage_1.default('Please provide jwt secret key.', 400));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (decoded) {
            req.user = decoded;
            next();
        }
    }
    catch (error) {
        return next(new errorMessage_1.default('Unauthorized user', 401));
    }
};
exports.veriFyUserToken = veriFyUserToken;
