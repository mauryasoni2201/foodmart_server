"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foodController_1 = require("../controllers/foodController");
const roleChecker_1 = __importDefault(require("../utils/roleChecker"));
const tokenHandler_1 = require("../utils/tokenHandler");
const foodRouter = express_1.default.Router();
foodRouter.route('/').get(foodController_1.getFoods).post(tokenHandler_1.veriFyUserToken, (0, roleChecker_1.default)("admin"), foodController_1.addFood);
foodRouter.route('/:id').get(foodController_1.getFoodItem).put(tokenHandler_1.veriFyUserToken, (0, roleChecker_1.default)("admin"), foodController_1.updateFoodItem).delete(tokenHandler_1.veriFyUserToken, (0, roleChecker_1.default)("admin"), foodController_1.deleteFoodItem);
exports.default = foodRouter;
