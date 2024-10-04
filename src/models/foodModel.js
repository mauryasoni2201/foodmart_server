"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const foodSchema = new mongoose_1.default.Schema({
    name: {
        required: true,
        type: String
    },
    price: {
        required: true,
        type: Number
    },
    description: {
        required: true,
        type: String
    },
    category: {
        required: true,
        type: String,
    },
    image: {
        type: String,
        default: ""
    },
    averageRating: {
        type: Number,
        default: 0
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
foodSchema.virtual("reviews", {
    localField: "_id",
    foreignField: "items.food",
    ref: "FoodMartOrders"
});
exports.default = mongoose_1.default.model("FoodMartItems", foodSchema);
