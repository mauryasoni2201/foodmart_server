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
exports.userReview = void 0;
const errorMessage_1 = __importDefault(require("../error/errorMessage"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const aggregateHandler_1 = __importDefault(require("../utils/aggregateHandler"));
exports.userReview = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    const findOrder = yield orderModel_1.default.findById(req.params.oid);
    if (findOrder) {
        yield orderModel_1.default.findByIdAndUpdate(req.params.oid, {
            rating: {
                review: req.body.review,
                rating: req.body.rating,
                time: date
            }
        });
        yield (0, aggregateHandler_1.default)();
        res.status(200).json({ message: "Thanks for rating." });
    }
    else {
        return next(new errorMessage_1.default(`Cannot find order with id of ${req.params.oid}.`, 404));
    }
}));
