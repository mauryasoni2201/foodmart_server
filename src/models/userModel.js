"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    mobile: {
        type: Number,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
    },
    role: {
        type: String,
        enum: ["user"],
        default: "user"
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ""
    },
    otp: {
        type: Number,
        default: 0
    },
    isUser: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: ""
    },
    userStatus: {
        type: Boolean,
        default: false
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual("orders", {
    ref: "FoodMartOrders",
    localField: "_id",
    foreignField: "user"
});
exports.default = mongoose_1.default.model("FoodMartUsers", userSchema);
