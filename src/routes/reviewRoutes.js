"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleChecker_1 = __importDefault(require("../utils/roleChecker"));
const reviewController_1 = require("../controllers/reviewController");
const reviewRouter = express_1.default.Router({ mergeParams: true });
reviewRouter.route('/').put((0, roleChecker_1.default)("user"), reviewController_1.userReview);
exports.default = reviewRouter;
