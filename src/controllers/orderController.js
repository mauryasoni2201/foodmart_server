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
exports.placeOrder = exports.getAllOrders = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const orderTemplate_1 = __importDefault(require("../ordertemplate/orderTemplate"));
const userModel_1 = __importDefault(require("../models/userModel"));
const errorMessage_1 = __importDefault(require("../error/errorMessage"));
const mailer = (mail, order) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.NODEMAILER_MAIL,
            pass: process.env.NODEMAILER_PASSCODE,
        },
    });
    const mailOptions = {
        from: process.env.NODEMAILER_MAIL,
        to: `${mail}`,
        subject: "Order details",
        text: "Your order details",
        html: `${order}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
        }
        else {
            console.log("Email sent: ", info.response);
        }
    });
};
exports.getAllOrders = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const allOrders = yield orderModel_1.default.find().populate({
        path: "user",
        select: "name address email"
    });
    res.status(200).json(allOrders);
}));
exports.placeOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const findUser = yield userModel_1.default.findById(user.id);
    if (findUser.address === "") {
        return next(new errorMessage_1.default('Go to edit profile and please add your address.', 400));
    }
    let orderDetails = [];
    let orders = ``;
    for (let i = 0; i < req.body.length; i++) {
        const { name, totalPrice, quantity, category, image, _id } = req.body[i];
        orders += `
        <tr>
        <td>${name}</td>
        <td>₹${totalPrice}</td>
        <td>${quantity}</td>
        <td>${category}</td>
        </tr>
        `;
        const details = {
            name,
            totalPrice,
            quantity,
            category,
            image,
            food: _id
        };
        orderDetails.push(details);
    }
    yield orderModel_1.default.create({ user: user.id, items: orderDetails });
    mailer(findUser === null || findUser === void 0 ? void 0 : findUser.email, (0, orderTemplate_1.default)(orders));
    res.status(201).json({ message: "Order placed successfully." });
}));
