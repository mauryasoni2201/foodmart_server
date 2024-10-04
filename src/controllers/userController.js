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
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.addUser = exports.updatePersonalDetails = exports.getPersonalDetails = exports.resetPassword = exports.verifyOtp = exports.verifyEmail = exports.verifyUser = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errorMessage_1 = __importDefault(require("../error/errorMessage"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailTemplate_1 = __importDefault(require("../emailtemplate/emailTemplate"));
const fs_1 = __importDefault(require("fs"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const aggregateHandler_1 = __importDefault(require("../utils/aggregateHandler"));
const path_1 = __importDefault(require("path"));
const tokenHandler_1 = require("../utils/tokenHandler");
const util_1 = require("util");
const generateOtp = () => {
    const otpContainer = [];
    for (let i = 0; i < 5; i++) {
        otpContainer.push(Math.floor(Math.random() * 9));
    }
    let otp = otpContainer.join('');
    return parseInt(otp);
};
const mailer = (email, otp, message) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.NODEMAILER_MAIL,
            pass: process.env.NODEMAILER_PASSCODE,
        },
    });
    const mailOptions = {
        from: process.env.NODEMAILER_MAIL,
        to: `${email}`,
        subject: `${message}`,
        text: "FoodMart Email Verification",
        html: (0, emailTemplate_1.default)(otp, message),
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
exports.registerUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, gender, mobile } = req.body;
    if (!email || !password || !name || !gender || !mobile) {
        return next(new errorMessage_1.default('Please enter valid details.', 400));
    }
    const findUser = yield userModel_1.default.findOne({ email });
    const findMobile = yield userModel_1.default.findOne({ mobile });
    if (findUser) {
        return next(new errorMessage_1.default('User exists.', 400));
    }
    else if (findMobile) {
        return next(new errorMessage_1.default('Phone number already used by someone.', 400));
    }
    else {
        let userDetails = Object.assign({}, req.body);
        userDetails.password = yield bcryptjs_1.default.hash(password, 10);
        const createdUser = yield userModel_1.default.create(userDetails);
        yield userModel_1.default.findByIdAndUpdate(createdUser._id, { otp: generateOtp() });
        const getOtp = yield userModel_1.default.findById(createdUser._id);
        mailer(getOtp === null || getOtp === void 0 ? void 0 : getOtp.email, getOtp === null || getOtp === void 0 ? void 0 : getOtp.otp, 'Email Verification');
        const token = (0, tokenHandler_1.generateToken)(createdUser._id);
        res.status(201).json({ token, message: "Reigstered Successfully." });
    }
}));
exports.loginUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new errorMessage_1.default('Please provide valid details.', 400));
    }
    const findUser = yield userModel_1.default.findOne({ email });
    if (findUser) {
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.isUser) === false) {
            return next(new errorMessage_1.default('Email not verified.', 401));
        }
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.userStatus) === false) {
            return next(new errorMessage_1.default('Your account is deactivated please contact to admin.', 400));
        }
        const comparePassword = yield bcryptjs_1.default.compare(password, findUser.password);
        if (comparePassword) {
            const token = (0, tokenHandler_1.generateToken)(findUser._id, findUser.role);
            res.status(200).json({ token, role: findUser.role, message: "Login Successfully." });
        }
        else {
            return next(new errorMessage_1.default('Please enter valid credentials.', 400));
        }
    }
    else {
        return next(new errorMessage_1.default('User not found.', 401));
    }
}));
exports.verifyUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        return next(new errorMessage_1.default('Please enter otp.', 400));
    }
    const user = req.user;
    const findUser = yield userModel_1.default.findById(user.id);
    if (findUser) {
        if (otp === findUser.otp) {
            yield userModel_1.default.findByIdAndUpdate(user.id, { isUser: true, otp: 0, userStatus: true });
            res.status(200).json({ message: "User verified." });
        }
        else {
            res.status(400).json({ message: "Invalid otp." });
        }
    }
    else {
        return next(new errorMessage_1.default('User not found.', 401));
    }
}));
exports.verifyEmail = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return next(new errorMessage_1.default('Please enter email.', 400));
    }
    const findUser = yield userModel_1.default.findOne({ email });
    if (!findUser) {
        return next(new errorMessage_1.default('Email not found.', 404));
    }
    if (findUser) {
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.isUser) === false) {
            return next(new errorMessage_1.default('Email not verified.', 401));
        }
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.userStatus) === false) {
            return next(new errorMessage_1.default('Your account is deactivated please contact to admin.', 400));
        }
        yield userModel_1.default.findByIdAndUpdate(findUser._id, { otp: generateOtp() });
        const userOtp = yield userModel_1.default.findById(findUser._id);
        mailer(userOtp === null || userOtp === void 0 ? void 0 : userOtp.email, userOtp === null || userOtp === void 0 ? void 0 : userOtp.otp, 'Reset Password');
        const token = (0, tokenHandler_1.generateToken)(findUser._id);
        res.status(200).json({ token, message: "Email verified." });
    }
}));
exports.verifyOtp = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        return next(new errorMessage_1.default('Please enter otp.', 400));
    }
    const user = req.user;
    const findUser = yield userModel_1.default.findById(user.id);
    if (findUser) {
        if (otp === findUser.otp) {
            yield userModel_1.default.findByIdAndUpdate(user.id, { otp: 0 });
            res.status(200).json({ message: "Otp verified." });
        }
        else {
            res.status(400).json({ message: "Invalid otp." });
        }
    }
}));
exports.resetPassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    if (!password) {
        return next(new errorMessage_1.default('Please enter password.', 400));
    }
    const userId = req.user;
    const findUser = yield userModel_1.default.findById(userId.id);
    const compare = yield bcryptjs_1.default.compare(password, findUser.password);
    if (compare) {
        return next(new errorMessage_1.default("The new password must be different from the old password.", 400));
    }
    let updatedPassword = yield bcryptjs_1.default.hash(password, 10);
    yield userModel_1.default.findByIdAndUpdate(userId.id, { password: updatedPassword });
    res.status(200).json({ message: "Password updated." });
}));
exports.getPersonalDetails = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const findUser = yield userModel_1.default.findById(id).populate({
        path: "orders",
        select: "_id items rating"
    });
    if ((findUser === null || findUser === void 0 ? void 0 : findUser.isUser) === false) {
        return next(new errorMessage_1.default('Email not verified.', 401));
    }
    if ((findUser === null || findUser === void 0 ? void 0 : findUser.userStatus) === false) {
        return next(new errorMessage_1.default('Your account is deactivated please contact to admin.', 400));
    }
    res.status(200).json(findUser);
}));
exports.updatePersonalDetails = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const findUser = yield userModel_1.default.findById(id);
    if (req.files) {
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.isUser) === false) {
            return next(new errorMessage_1.default('Email not verified.', 401));
        }
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.userStatus) === false) {
            return next(new errorMessage_1.default('Your account is deactivated, please contact the admin.', 400));
        }
        const file = req.files.photo;
        if (!file.mimetype.startsWith('image')) {
            return next(new errorMessage_1.default('Please upload an image.', 400));
        }
        if (path_1.default.parse(file.name).ext !== ".png") {
            return next(new errorMessage_1.default('Upload image in png format.', 400));
        }
        if (file.size > process.env.MAX_FILE_SIZE) {
            return next(new errorMessage_1.default('Photo size exceeds the 2MB limit', 400));
        }
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.image) !== "") {
            const imagePath = path_1.default.resolve(__dirname, '..', 'public', 'uploads', 'users', findUser.image);
            try {
                yield fs_1.default.promises.unlink(imagePath);
            }
            catch (err) {
                return next(new errorMessage_1.default('Error occurred while deleting old image.', 400));
            }
        }
        file.name = `photo${Date.now()}${path_1.default.parse(file.name).ext}`;
        try {
            const mvAsync = (0, util_1.promisify)(file.mv);
            const filePath = path_1.default.join(__dirname, '../public/uploads/users', file.name);
            yield mvAsync(filePath);
            yield userModel_1.default.findByIdAndUpdate(id, Object.assign({ image: file.name }, req.body));
            return res.status(200).json({ message: "User details updated." });
        }
        catch (err) {
            return next(new errorMessage_1.default('Error occurred while uploading file.', 500));
        }
    }
    else {
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.isUser) === false) {
            return next(new errorMessage_1.default('Email not verified.', 401));
        }
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.userStatus) === false) {
            return next(new errorMessage_1.default('Your account is deactivated, please contact the admin.', 400));
        }
        yield userModel_1.default.findByIdAndUpdate(id, req.body);
        return res.status(200).json({ message: "User details updated." });
    }
}));
exports.addUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const findUser = yield userModel_1.default.findOne({ email });
    if (findUser) {
        return next(new errorMessage_1.default('User exists.', 200));
    }
    const userDetails = Object.assign({}, req.body);
    userDetails.otp = 0;
    userDetails.isUser = true;
    userDetails.userStatus = true;
    userDetails.password = yield bcryptjs_1.default.hash(password, 10);
    yield userModel_1.default.create(userDetails);
    res.status(201).json({ message: "New user created." });
}));
exports.getUsers = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search;
    let query;
    if (search && search.trim() !== '') {
        query = yield userModel_1.default.find({ name: { $regex: search, $options: 'i' } });
        res.status(200).json(query);
    }
    else {
        query = yield userModel_1.default.find();
        res.status(200).json(query);
    }
}));
exports.getUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        return next(new errorMessage_1.default('Please provide an user id.', 400));
    }
    const findOneUser = yield userModel_1.default.findById(req.params.id);
    if (!findOneUser) {
        return next(new errorMessage_1.default(`Could not user with an id of ${req.params.id}`, 404));
    }
    res.status(200).json(findOneUser);
}));
exports.updateUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        return next(new errorMessage_1.default('Please provide an user id.', 400));
    }
    const findUser = yield userModel_1.default.findById(req.params.id);
    if (req.files) {
        const file = req.files.photo;
        if (!file.mimetype.startsWith('image')) {
            return next(new errorMessage_1.default('Please upload an image.', 400));
        }
        if (path_1.default.parse(file.name).ext !== ".png") {
            return next(new errorMessage_1.default('Upload image in png format.', 400));
        }
        if (file.size > process.env.MAX_FILE_SIZE) {
            return next(new errorMessage_1.default('Photo size exceeds the 2MB limit', 400));
        }
        if ((findUser === null || findUser === void 0 ? void 0 : findUser.image) !== "") {
            const imagePath = path_1.default.resolve(__dirname, '..', 'public', 'uploads', 'users', findUser.image);
            try {
                yield fs_1.default.promises.unlink(imagePath);
            }
            catch (err) {
                return next(new errorMessage_1.default('Error while updating user profile.', 400));
            }
        }
        file.name = `photo${Date.now()}${path_1.default.parse(file.name).ext}`;
        try {
            const mvAsync = (0, util_1.promisify)(file.mv);
            const filePath = path_1.default.join(__dirname, '../public/uploads/users', file.name);
            yield mvAsync(filePath);
            yield userModel_1.default.findByIdAndUpdate(req.params.id, Object.assign({ image: file.name }, req.body));
            return res.status(200).json({ message: "Photo uploaded successfully." });
        }
        catch (err) {
            return next(new errorMessage_1.default('Error occurred while uploading file.', 500));
        }
    }
    else {
        yield userModel_1.default.findByIdAndUpdate(req.params.id, req.body);
        return res.status(200).json({ message: "User details updated successfully." });
    }
}));
exports.deleteUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        return next(new errorMessage_1.default('Please provide an user id.', 400));
    }
    const findUser = yield userModel_1.default.findById(req.params.id);
    if (!findUser) {
        return next(new errorMessage_1.default(`Could not user with an id of ${req.params.id}`, 404));
    }
    if ((findUser === null || findUser === void 0 ? void 0 : findUser.image) !== "") {
        const imagePath = path_1.default.resolve(__dirname, '..', 'public', 'uploads', 'users', findUser.image);
        try {
            yield fs_1.default.promises.unlink(imagePath);
        }
        catch (err) {
            return next(new errorMessage_1.default('Error occured while deleting user profile', 400));
        }
    }
    const orders = yield orderModel_1.default.find({ user: findUser._id });
    if (orders.length > 0) {
        for (let i = 0; i < orders.length; i++) {
            yield orderModel_1.default.findByIdAndDelete(orders[i]);
        }
    }
    yield userModel_1.default.findByIdAndDelete(req.params.id);
    (0, aggregateHandler_1.default)();
    res.status(200).json({ message: "User removed successfully." });
}));
