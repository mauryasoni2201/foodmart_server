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
exports.deleteFoodItem = exports.updateFoodItem = exports.getFoodItem = exports.addFood = exports.getFoods = void 0;
const foodModel_1 = __importDefault(require("../models/foodModel"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errorMessage_1 = __importDefault(require("../error/errorMessage"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
exports.getFoods = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const category = req.query.category;
    const search = req.query.search;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const start = (page - 1) * limit;
    const total = yield foodModel_1.default.countDocuments();
    let foods;
    if (category) {
        foods = yield foodModel_1.default.find({ category });
        res.status(200).json({ foods });
    }
    else if (search) {
        const searchRegex = new RegExp(search, 'i');
        foods = yield foodModel_1.default.find({ name: { $regex: searchRegex } });
        res.status(200).json({ foods });
    }
    else {
        foods = yield foodModel_1.default.find({}).skip(start).limit(limit);
        res.status(200).json({ foods, count: total });
    }
}));
exports.addFood = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const photo = (_a = req.files) === null || _a === void 0 ? void 0 : _a.photo;
    if (!photo) {
        return next(new errorMessage_1.default('Please upload an image.', 400));
    }
    if (!req.files || !req.files.photo) {
        return next(new errorMessage_1.default('Please upload a photo.', 400));
    }
    const file = req.files.photo;
    if (!file.mimetype.startsWith('image')) {
        return next(new errorMessage_1.default('Please upload an image.', 400));
    }
    if (path_1.default.parse(file.name).ext !== ".png") {
        return next(new errorMessage_1.default('Upload an image and in png format.', 400));
    }
    if (file.size > process.env.MAX_FILE_SIZE) {
        return next(new errorMessage_1.default('Photo size exceeds the 2MB limit', 400));
    }
    file.name = `photo${Date.now()}${path_1.default.parse(file.name).ext}`;
    const mvAsync = (0, util_1.promisify)(file.mv);
    const filePath = path_1.default.join(__dirname, '../public/uploads/foods', file.name);
    mvAsync(filePath)
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        yield foodModel_1.default.create({
            image: file.name,
            name: req.body.name,
            category: req.body.category.toLowerCase(),
            price: req.body.price,
            description: req.body.description
        });
        res.status(201).json({ message: "Food item added." });
    }))
        .catch((err) => {
        return next(new errorMessage_1.default('Error occurred while adding food.', 500));
    });
}));
exports.getFoodItem = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return next(new errorMessage_1.default('Please provide an id.', 400));
    }
    const findItem = yield foodModel_1.default.findById(id).populate({
        path: "reviews",
        populate: [
            {
                path: "items.food",
                select: "name category image",
            },
            {
                path: "user",
                select: "name email",
            },
        ],
    });
    if (!findItem) {
        return next(new errorMessage_1.default(`Could not find a food item with an id of ${id}.`, 400));
    }
    res.status(200).json(findItem);
}));
exports.updateFoodItem = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return next(new errorMessage_1.default('Please provide an id.', 400));
    }
    if (req.files) {
        const findFood = yield foodModel_1.default.findById(req.params.id);
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
        if ((findFood === null || findFood === void 0 ? void 0 : findFood.image) !== "") {
            const imagePath = path_1.default.resolve(__dirname, '..', 'public', 'uploads', 'foods', findFood.image);
            try {
                yield fs_1.default.promises.unlink(imagePath);
            }
            catch (err) {
                return next(new errorMessage_1.default('Error occurred while updating.', 400));
            }
        }
        file.name = `photo${Date.now()}${path_1.default.parse(file.name).ext}`;
        try {
            const mvAsync = (0, util_1.promisify)(file.mv);
            const filePath = path_1.default.join(__dirname, '../public/uploads/foods', file.name);
            yield mvAsync(filePath);
            yield foodModel_1.default.findByIdAndUpdate(id, {
                image: file.name,
                name: req.body.name,
                category: req.body.category.toLowerCase(),
                price: req.body.price,
                description: req.body.description
            });
            return res.status(200).json({ message: "Food details updated." });
        }
        catch (err) {
            return next(new errorMessage_1.default('Error occured while updating food.', 500));
        }
    }
    else {
        const updatedFood = yield foodModel_1.default.findByIdAndUpdate(id, {
            name: req.body.name,
            category: req.body.category.toLowerCase(),
            price: req.body.price,
            description: req.body.description
        });
        if (!updatedFood) {
            return next(new errorMessage_1.default(`Could not food item with an id of ${id}.`, 400));
        }
        res.status(200).json({ messagee: "Food details updated." });
    }
}));
exports.deleteFoodItem = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        return next(new errorMessage_1.default('Please provide an id.', 400));
    }
    const findFood = yield foodModel_1.default.findById(id);
    if (!findFood) {
        return next(new errorMessage_1.default(`Could not food item with an id of ${id}.`, 400));
    }
    const imagePath = path_1.default.resolve(__dirname, '..', 'public', 'uploads', 'foods', findFood.image);
    fs_1.default.unlink(imagePath, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return next(new errorMessage_1.default('Error occurred while deleting food item.', 400));
        }
        yield foodModel_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Food item deleted.' });
    }));
}));
