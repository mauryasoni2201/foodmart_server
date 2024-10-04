import { Request,Response,NextFunction } from "express";
import CustomError from "../error/errorMessage";

const checkRole=(...roles:string[])=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        if(typeof req.user === "object"){
            if(!roles.includes(req.user?.role)){
                return next (new CustomError('You are not authorized to perform this action.',403));
            }
        }
        next();
    }
}
export default checkRole