import { NextFunction,Request,Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Orders from "../models/orderModel"
import nodemailer from "nodemailer";
import orderTemplate from "../ordertemplate/orderTemplate";
import userModel from "../models/userModel";
import CustomError from "../error/errorMessage";

const mailer = (mail:any, order:string) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
        user: process.env.NODEMAILER_MAIL,
        pass: process.env.NODEMAILER_PASSCODE,
        },
    });
  const mailOptions = {
    from: process.env.NODEMAILER_MAIL,
    to: `${mail}`,
    subject: "Order details",
    text: "Your order details",
    html: `${order}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

export const getAllOrders=asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const allOrders = await Orders.find().populate({
        path:"user",
        select:"name address email"
    });
    res.status(200).json(allOrders);
});

export const placeOrder= asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const user:object|any = req.user;
    const findUser:object|any = await userModel.findById(user.id);
    if(findUser.address===""){
      return next(new CustomError('Go to edit profile and please add your address.', 400));
    }
    let orderDetails:any[] = [];
    let orders:string = ``;
    for(let i=0;i<req.body.length;i++){
        const {name,totalPrice,quantity,category,image,_id} = req.body[i];
        orders+=`
        <tr>
        <td>${name}</td>
        <td>₹${totalPrice}</td>
        <td>${quantity}</td>
        <td>${category}</td>
        </tr>
        `;
        const details:object|any = {
            name,
            totalPrice,
            quantity,
            category,
            image,
            food:_id 
        }
        orderDetails.push(details);
    }
    await Orders.create({user:user.id,items:orderDetails});
    mailer(findUser?.email,orderTemplate(orders));
    res.status(201).json({message:"Order placed successfully."})
});