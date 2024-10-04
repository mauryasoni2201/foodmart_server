import express from  "express";
import checkRole from "../utils/roleChecker";
import { veriFyUserToken } from "../utils/tokenHandler";
import { getAllOrders,placeOrder } from "../controllers/orderController";
import reviewRouter from "./reviewRoutes";

const orderRoutes = express.Router();

orderRoutes.use('/:oid/review',veriFyUserToken,reviewRouter);
orderRoutes.route('/').get(veriFyUserToken,checkRole("admin"),getAllOrders).post(veriFyUserToken,placeOrder);

export default orderRoutes;