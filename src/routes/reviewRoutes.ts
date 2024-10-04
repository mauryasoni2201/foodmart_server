import express from "express";
import checkRole from "../utils/roleChecker";
import { userReview } from "../controllers/reviewController";

const reviewRouter = express.Router({mergeParams:true});
reviewRouter.route('/').put(checkRole("user"),userReview);

export default reviewRouter;