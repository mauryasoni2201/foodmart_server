import User from "../models/userModel";
import asyncHandler from "../utils/asyncHandler";
import CustomError from "../error/errorMessage";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import emailTemplate from "../emailtemplate/emailTemplate";
import fs from "fs";
import Orders from "../models/orderModel";
import calculateAggregateRatings from "../utils/aggregateHandler";
import path from "path";
import { Request,Response,NextFunction } from "express";
import {generateToken} from "../utils/tokenHandler";
import { promisify } from 'util';

const generateOtp=():number=>{
    const otpContainer:number[] = [];
    for(let i=0;i<5;i++){
        otpContainer.push(Math.floor(Math.random()*9));
    }
    let otp = otpContainer.join('');
    return parseInt(otp);
}

const mailer = (email:any,otp:any,message:string):void => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
        user: process.env.NODEMAILER_MAIL,
        pass: process.env.NODEMAILER_PASSCODE,
        },
    });
    const mailOptions = {
        from: process.env.NODEMAILER_MAIL,
        to: `${email}`,
        subject: `${message}`,
        text: "FoodMart Email Verification",
        html: emailTemplate(otp,message),
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
        } else {
            console.log("Email sent: ", info.response);
        }
    });
};

export const registerUser=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password,name,gender,mobile} = req.body;
    if(!email||!password||!name||!gender||!mobile){
        return next(new CustomError('Please enter valid details.',400));
    }
    const findUser:object|any = await User.findOne({email});
    const findMobile:object|any = await User.findOne({mobile});
    if(findUser){
        return next(new CustomError('User exists.',400));
    }else if(findMobile){ 
        return next(new CustomError('Phone number already used by someone.',400));
    }
    else{
        let userDetails = {...req.body};
        userDetails.password = await bcrypt.hash(password,10);
        const createdUser = await User.create(userDetails);
        await User.findByIdAndUpdate(createdUser._id,{otp:generateOtp()});
        const getOtp = await User.findById(createdUser._id);
        mailer(getOtp?.email,getOtp?.otp,'Email Verification');
        const token = generateToken(createdUser._id);
        res.status(201).json({token,message:"Reigstered Successfully."});
    }
});

export const loginUser =asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password} = req.body;
    if(!email||!password){
        return next(new CustomError('Please provide valid details.',400));
    }
    const findUser = await User.findOne({email});
    if(findUser){
        if(findUser?.isUser===false){
            return next(new CustomError('Email not verified.',401)); 
        }
        if(findUser?.userStatus===false){
            return next(new CustomError('Your account is deactivated please contact to admin.',400)); 
        } 
        const comparePassword = await bcrypt.compare(password,findUser.password);
        if(comparePassword){
            const token = generateToken(findUser._id,findUser.role);
            res.status(200).json({token,role:findUser.role,message:"Login Successfully."});
        }else{
            return next(new CustomError('Please enter valid credentials.',400));
        }
    }
    else{
        return next(new CustomError('User not found.',401));
    }
});

export const verifyUser=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {otp} = req.body;
    if(!otp){
        return next(new CustomError('Please enter otp.',400));
    }
    const user:any = req.user;
    const findUser = await User.findById(user.id);
    if(findUser){
        if(otp===findUser.otp){
            await User.findByIdAndUpdate(user.id,{isUser:true,otp:0,userStatus:true});
            res.status(200).json({message:"User verified."});
        }else{
            res.status(400).json({message:"Invalid otp."})
        }
    }else{
        return next(new CustomError('User not found.',401));
    }
}); 

export const verifyEmail=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {email} = req.body;
    if(!email){
        return next(new CustomError('Please enter email.',400));
    }
    const findUser = await User.findOne({email});
    if(!findUser){
        return next(new CustomError('Email not found.',404));
    }
    if(findUser){
        if(findUser?.isUser===false){
            return next(new CustomError('Email not verified.',401)); 
        }
        if(findUser?.userStatus===false){
            return next(new CustomError('Your account is deactivated please contact to admin.',400)); 
        } 
        await User.findByIdAndUpdate(findUser._id,{otp:generateOtp()});
        const userOtp =  await User.findById(findUser._id);
        mailer(userOtp?.email,userOtp?.otp,'Reset Password');
        const token = generateToken(findUser._id);
        res.status(200).json({token,message:"Email verified."});
    }
});

export const verifyOtp=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {otp} = req.body; 
    if(!otp){
        return next(new CustomError('Please enter otp.',400));
    }
    const user:any = req.user;
    const findUser = await User.findById(user.id);
    if(findUser){
        if(otp===findUser.otp){
            await User.findByIdAndUpdate(user.id,{otp:0});
            res.status(200).json({message:"Otp verified."});
        }else{
            res.status(400).json({message:"Invalid otp."})
        }
    }
}); 

export const resetPassword=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {password} = req.body;
    if(!password){
        return next(new CustomError('Please enter password.',400));
    }
    const userId:any = req.user;
    const findUser:any = await User.findById(userId.id);
    const compare = await bcrypt.compare(password,findUser.password);
    if(compare){
        return next(new CustomError("The new password must be different from the old password.",400));
    }
    let updatedPassword  = await bcrypt.hash(password,10);
    await User.findByIdAndUpdate(userId.id,{password:updatedPassword});
    res.status(200).json({message:"Password updated."});
});

export const getPersonalDetails=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {id} = req.user as string|any;
    const findUser:object|any = await User.findById(id).populate({
        path:"orders",
        select:"_id items rating"
    })
    if(findUser?.isUser===false){
        return next(new CustomError('Email not verified.',401)); 
    }
    if(findUser?.userStatus===false){
        return next(new CustomError('Your account is deactivated please contact to admin.',400)); 
    } 
    res.status(200).json(findUser);
});

export const updatePersonalDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.user as string|any;
    const findUser:object|any = await User.findById(id);
    if (req.files) {
        if (findUser?.isUser === false) {
            return next(new CustomError('Email not verified.', 401));
        }
        if (findUser?.userStatus === false) {
            return next(new CustomError('Your account is deactivated, please contact the admin.', 400));
        }
        const file: any = req.files.photo;
        if (!file.mimetype.startsWith('image')) {
            return next(new CustomError('Please upload an image.', 400));
        }
        if (path.parse(file.name).ext !== ".png") {
            return next(new CustomError('Upload image in png format.', 400));
        }
        if (file.size>(process.env.MAX_FILE_SIZE as number|any)) {
           return next(new CustomError('Photo size exceeds the 2MB limit', 400));
        }
        if (findUser?.image !== "") {
            const imagePath = path.resolve(__dirname, '..', 'public', 'uploads', 'users', findUser.image);
            try {
                await fs.promises.unlink(imagePath);
            } catch (err) {
                return next(new CustomError('Error occurred while deleting old image.', 400));
            }
        }
        file.name = `photo${Date.now()}${path.parse(file.name).ext}`;
        try {
            const mvAsync = promisify(file.mv);
            const filePath = path.join(__dirname, '../public/uploads/users', file.name);
            await mvAsync(filePath);
            await User.findByIdAndUpdate(id, {image: file.name,...req.body});
            return res.status(200).json({ message: "User details updated." });
        } catch (err: any) {
            return next(new CustomError('Error occurred while uploading file.', 500));
        }
    } else {
        if (findUser?.isUser === false) {
            return next(new CustomError('Email not verified.', 401));
        }
        if (findUser?.userStatus === false) {
            return next(new CustomError('Your account is deactivated, please contact the admin.', 400));
        }
        await User.findByIdAndUpdate(id, req.body);
        return res.status(200).json({ message: "User details updated." });
    }
})

export const addUser=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password} = req.body;
    const findUser:object|any = await User.findOne({email});
    if(findUser){
        return next(new CustomError('User exists.',200));
    }
    const userDetails = {...req.body};
    userDetails.otp = 0;
    userDetails.isUser = true;
    userDetails.userStatus = true;
    userDetails.password = await bcrypt.hash(password,10);
    await User.create(userDetails);
    res.status(201).json({message:"New user created."});
});

export const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const search = req.query.search as string | undefined;
    let query;
    if (search && search.trim() !== '') {
        query = await User.find({ name: { $regex: search, $options: 'i' } });
        res.status(200).json(query);
    } else {
        query = await User.find();
        res.status(200).json(query);
    }
});


export const getUser = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    if(!req.params.id){
        return next(new CustomError('Please provide an user id.',400));
    }
    const findOneUser:object|any = await User.findById(req.params.id);
    if(!findOneUser){
       return next(new CustomError(`Could not user with an id of ${req.params.id}`,404));
    }
    res.status(200).json(findOneUser);
});

export const updateUser = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    if(!req.params.id){
        return next(new CustomError('Please provide an user id.',400));
    }
    const findUser:object|any = await User.findById(req.params.id);
    if (req.files) {
        const file:File|any = req.files.photo;
        if (!file.mimetype.startsWith('image')) {
            return next(new CustomError('Please upload an image.', 400));
        }
        if (path.parse(file.name).ext !== ".png") {
            return next(new CustomError('Upload image in png format.', 400));
        }
        if (file.size>(process.env.MAX_FILE_SIZE as number|any)) {
            return next(new CustomError('Photo size exceeds the 2MB limit', 400));
         }
        if (findUser?.image !== "") {
            const imagePath = path.resolve(__dirname, '..', 'public', 'uploads', 'users', findUser.image);
            try {
                await fs.promises.unlink(imagePath);
            } catch (err) {
                return next(new CustomError('Error while updating user profile.', 400));
            }
        }
        file.name = `photo${Date.now()}${path.parse(file.name).ext}`;
        try {
            const mvAsync = promisify(file.mv);
            const filePath = path.join(__dirname, '../public/uploads/users', file.name);
            await mvAsync(filePath);
            await User.findByIdAndUpdate(req.params.id, {image: file.name,...req.body});
            return res.status(200).json({ message: "Photo uploaded successfully." });
        } catch (err: any) {
            return next(new CustomError('Error occurred while uploading file.', 500));
        }
    } else {
        await User.findByIdAndUpdate(req.params.id, req.body);
        return res.status(200).json({ message: "User details updated successfully." });
    }
});

export const deleteUser = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    if(!req.params.id){
        return next(new CustomError('Please provide an user id.',400));
    }
    const findUser:object|any = await User.findById(req.params.id);
    if(!findUser){
        return next(new CustomError(`Could not user with an id of ${req.params.id}`,404));
    }
    if (findUser?.image !== "") {
        const imagePath = path.resolve(__dirname, '..', 'public', 'uploads', 'users', findUser.image);
        try {
            await fs.promises.unlink(imagePath);
        } catch (err) {
            return next(new CustomError('Error occured while deleting user profile', 400));
        }
    }
    const orders:[]|any = await Orders.find({user:findUser._id});
    if(orders.length>0){
    for(let i=0;i<orders.length;i++){
        await Orders.findByIdAndDelete(orders[i]);
    }}
    await User.findByIdAndDelete(req.params.id);
    calculateAggregateRatings();
    res.status(200).json({message:"User removed successfully."})
});

    