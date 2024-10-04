import { Request, Response, NextFunction } from "express";
import CustomError from "./errorMessage";
import mongoose from "mongoose";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let error = { ...err } as CustomError;
    error.message = err.message;
    if (err instanceof mongoose.Error.CastError) {
        const message = `Could not find item with id of ${err.value}!`;
        error = new CustomError(message, 404);
    }
    if ((err as any).code === 11000) {
        const message = `Duplicate field value entered!`;
        error = new CustomError(message, 400);
    }
    if (err instanceof mongoose.Error.ValidationError) {
        const message = Object.values(err.errors).map((element: any) => element.message).join(', ');
        error = new CustomError(message, 422);
    }
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
};
export default errorHandler;
