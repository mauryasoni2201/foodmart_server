"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorMessage_1 = __importDefault(require("../error/errorMessage"));
const checkRole = (...roles) => {
    return (req, res, next) => {
        var _a;
        if (typeof req.user === "object") {
            if (!roles.includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
                return next(new errorMessage_1.default('You are not authorized to perform this action.', 403));
            }
        }
        next();
    };
};
exports.default = checkRole;
