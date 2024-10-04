import CustomError from "../error/errorMessage";
import Orders from "../models/orderModel";
import asyncHandler from "../utils/asyncHandler";
import calculateAggregateRatings from "../utils/aggregateHandler";
import {Request,Response,NextFunction} from "express";

export const userReview = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const date = new Date();
    const findOrder = await Orders.findById(req.params.oid);
    if(findOrder){
        await Orders.findByIdAndUpdate(req.params.oid,{
            rating:{
                review:req.body.review,
                rating:req.body.rating,
                time:date
            }
        });
        await calculateAggregateRatings();
        res.status(200).json({message:"Thanks for rating."});
    }
    else{
       return next(new CustomError(`Cannot find order with id of ${req.params.oid}.`,404));
    }
});