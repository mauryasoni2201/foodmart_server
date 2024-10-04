import express from "express";
import {addFood, deleteFoodItem, getFoods, updateFoodItem ,getFoodItem} from "../controllers/foodController";
import checkRole from "../utils/roleChecker";
import {veriFyUserToken} from "../utils/tokenHandler";

const foodRouter = express.Router();
foodRouter.route('/').get(getFoods).post(veriFyUserToken,checkRole("admin"),addFood);
foodRouter.route('/:id').get(getFoodItem).put(veriFyUserToken,checkRole("admin"),updateFoodItem).delete(veriFyUserToken,checkRole("admin"),deleteFoodItem);

export default foodRouter;