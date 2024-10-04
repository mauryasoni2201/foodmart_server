"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleChecker_1 = __importDefault(require("../utils/roleChecker"));
const tokenHandler_1 = require("../utils/tokenHandler");
const orderController_1 = require("../controllers/orderController");
const reviewRoutes_1 = __importDefault(require("./reviewRoutes"));
const orderRoutes = express_1.default.Router();
orderRoutes.use('/:oid/review', tokenHandler_1.veriFyUserToken, reviewRoutes_1.default);
orderRoutes.route('/').get(tokenHandler_1.veriFyUserToken, (0, roleChecker_1.default)("admin"), orderController_1.getAllOrders).post(tokenHandler_1.veriFyUserToken, orderController_1.placeOrder);
exports.default = orderRoutes;
