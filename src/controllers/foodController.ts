import Food from "../models/foodModel";
import asyncHandler from "../utils/asyncHandler";
import CustomError from "../error/errorMessage";
import path from "path";
import fs from "fs";
import {NextFunction ,Request,Response} from "express";
import { promisify } from 'util';

export const getFoods=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const category:string|any = req.query.category;
    const search:string|any = req.query.search;
    const page:number = parseInt(req.query.page as string,10)||1;
    const limit:number = parseInt(req.query.limit as string,10)||10;
    const start:number = (page-1)*limit;
    const total:number = await Food.countDocuments();
    let foods:any;
    if(category){
       foods = await Food.find({category});
       res.status(200).json({foods});
    }else if(search){
        const searchRegex = new RegExp(search, 'i');
        foods = await Food.find({ name: { $regex: searchRegex } });
        res.status(200).json({foods});
    }else{
      foods = await Food.find({}).skip(start).limit(limit);
      res.status(200).json({foods,count:total});
    }
});

export const addFood = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const photo = req.files?.photo;
    if(!photo){
        return next(new CustomError('Please upload an image.',400));
    }
    if (!req.files || !req.files.photo) {
        return next(new CustomError('Please upload a photo.', 400));
    }
    const file: any = req.files.photo;
    if (!file.mimetype.startsWith('image')) {
        return next(new CustomError('Please upload an image.', 400));
    }
    if (path.parse(file.name).ext !== ".png") {
        return next(new CustomError('Upload an image and in png format.', 400));
    }
    if (file.size>(process.env.MAX_FILE_SIZE as number|any)) {
        return next(new CustomError('Photo size exceeds the 2MB limit', 400));
     }
    file.name = `photo${Date.now()}${path.parse(file.name).ext}`;
    const mvAsync = promisify(file.mv);
    const filePath = path.join(__dirname, '../public/uploads/foods', file.name);
    mvAsync(filePath)
        .then(async () => {
            await Food.create({
                image:file.name,
                name:req.body.name,
                category:req.body.category.toLowerCase(),
                price:req.body.price,
                description:req.body.description
            });
            res.status(201).json({ message: "Food item added." });
        })
        .catch((err:any) => {
            return next(new CustomError('Error occurred while adding food.', 500));
        });
});

export const getFoodItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
      return next(new CustomError('Please provide an id.', 400));
    } 
    const findItem = await Food.findById(id).populate({
      path: "reviews",
      populate: [
        {
          path: "items.food",
          select: "name category image",
        },
        {
          path: "user",
          select: "name email",
        },
      ],
    });
    if (!findItem) {
      return next(new CustomError(`Could not find a food item with an id of ${id}.`, 400));
    }
    res.status(200).json(findItem);
  });


export const updateFoodItem = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {id} = req.params;
    if(!id){
        return next(new CustomError('Please provide an id.',400));   
    }
    if(req.files){
        const findFood:object|any = await Food.findById(req.params.id);
        const file:object|any = req.files.photo;
        if (!file.mimetype.startsWith('image')) {
            return next(new CustomError('Please upload an image.', 400));
        }
        if (path.parse(file.name).ext !== ".png") {
            return next(new CustomError('Upload image in png format.', 400));
        }
        if (file.size>(process.env.MAX_FILE_SIZE as number|any)) {
            return next(new CustomError('Photo size exceeds the 2MB limit', 400));
         }
        if (findFood?.image !== "") {
            const imagePath = path.resolve(__dirname, '..', 'public', 'uploads', 'foods', findFood.image);
            try {
                await fs.promises.unlink(imagePath);
            } catch (err) {
                return next(new CustomError('Error occurred while updating.', 400));
            }
        }
        file.name = `photo${Date.now()}${path.parse(file.name).ext}`;
        try {
            const mvAsync = promisify(file.mv);
            const filePath = path.join(__dirname, '../public/uploads/foods', file.name);
            await mvAsync(filePath);
            await Food.findByIdAndUpdate(id,{
                image:file.name,
                name:req.body.name,
                category:req.body.category.toLowerCase(),
                price:req.body.price,
                description:req.body.description
            });
            return res.status(200).json({ message: "Food details updated." });
        } catch (err: any) {
            return next(new CustomError('Error occured while updating food.', 500));
        }
    }else{
        const updatedFood = await Food.findByIdAndUpdate(id,{
            name:req.body.name,
            category:req.body.category.toLowerCase(),
            price:req.body.price,
            description:req.body.description
        });
        if(!updatedFood){
            return next(new CustomError(`Could not food item with an id of ${id}.`,400));
        }
        res.status(200).json({messagee:"Food details updated."});
    }
});

export const deleteFoodItem = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const id = req.params.id;
    if(!id){
        return next(new CustomError('Please provide an id.',400));   
    }   
    const findFood:any = await Food.findById(id);
    if(!findFood){
        return next(new CustomError(`Could not food item with an id of ${id}.`,400));
    }
    const imagePath = path.resolve(__dirname, '..', 'public', 'uploads', 'foods', findFood.image);
    fs.unlink(imagePath, async (err: any) => {
    if (err) {
        return next(new CustomError('Error occurred while deleting food item.', 400));
    }
    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Food item deleted.' });
});});