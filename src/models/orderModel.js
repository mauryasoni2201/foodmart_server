"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    items: {
        type: [
            {
                name: String,
                quantity: Number,
                totalPrice: Number,
                category: String,
                image: String,
                food: {
                    type: mongoose_1.default.Schema.ObjectId,
                    ref: "FoodMartItems",
                },
            },
        ],
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: "FoodMartUsers",
        required: true,
    },
    rating: {
        type: {
            review: { type: String },
            rating: { type: Number, min: 0, max: 5 },
            time: { type: Date },
        },
        default: {},
    },
});
exports.default = mongoose_1.default.model("FoodMartOrders", orderSchema);
