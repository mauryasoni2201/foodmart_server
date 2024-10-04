import express, { Router } from "express";
import {addUser, deleteUser, getUsers, getUser, getPersonalDetails, loginUser,registerUser, resetPassword, updatePersonalDetails, updateUser, verifyEmail, verifyOtp, verifyUser} from "../controllers/userController";
import { veriFyUserToken} from "../utils/tokenHandler";
import checkRole from "../utils/roleChecker";

const userRoutes:Router = express.Router();
userRoutes.route('/register').post(registerUser);
userRoutes.route('/login').post(loginUser);
userRoutes.route('/verify').post(veriFyUserToken,verifyUser);

userRoutes.route('/verify-email').post(verifyEmail);
userRoutes.route('/verify-otp').post(veriFyUserToken,verifyOtp);
userRoutes.route('/forgot-password').put(veriFyUserToken,resetPassword);

userRoutes.route('/user-details').get(veriFyUserToken,getPersonalDetails);
userRoutes.route('/update-userdetails').put(veriFyUserToken,updatePersonalDetails);

userRoutes.route('/users').get(veriFyUserToken,checkRole("admin"),getUsers).post(veriFyUserToken,checkRole("admin"),addUser);
userRoutes.route('/users/:id').get(veriFyUserToken,checkRole("admin"),getUser).put(veriFyUserToken,checkRole("admin"),updateUser).delete(veriFyUserToken,checkRole("admin"),deleteUser);
export default userRoutes;