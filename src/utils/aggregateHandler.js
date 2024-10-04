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
const orderModel_1 = __importDefault(require("../models/orderModel"));
const foodModel_1 = __importDefault(require("../models/foodModel"));
const calculateAggregateRatings = () => __awaiter(void 0, void 0, void 0, function* () {
    const aggregateResults = yield orderModel_1.default.aggregate([
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: "$items.food",
                averageRating: {
                    $avg: {
                        $cond: [
                            { $ne: ["$rating.rating", null] },
                            "$rating.rating",
                            0
                        ]
                    }
                }
            }
        }
    ]);
    for (const result of aggregateResults) {
        yield foodModel_1.default.findByIdAndUpdate(result._id, {
            averageRating: parseFloat(result.averageRating.toFixed(2))
        });
    }
});
exports.default = calculateAggregateRatings;
