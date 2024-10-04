import { NextFunction ,Response,Request} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import CustomError from "../error/errorMessage";

export const generateToken=(id:Types.ObjectId,role?:string):any=>{
    if(process.env.JWT_SECRET&&process.env.JWT_EXPIRE){
    const token = jwt.sign({id,role}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    return token;
}}

declare module 'express-serve-static-core' {
    interface Request {
        user?: string | JwtPayload;
    }
}

export const veriFyUserToken =(req:Request,res:Response,next:NextFunction)=>{
    let token:string|undefined;
    const headers = req.headers.authorization;
    if(headers&&headers.startsWith('Bearer')){
        token = headers.split(' ')[1];
    }
    if(!token){
        return next(new CustomError('Token is required.',400));
    }
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret){
        return next(new CustomError('Please provide jwt secret key.',400));
    }
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;  
        if (decoded) {
          req.user = decoded;
          next();
        }
      } catch (error) {
        return next(new CustomError('Unauthorized user', 401));
      }
}