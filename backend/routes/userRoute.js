import express from 'express';
import { loginUser,registerUser, getUser, createAdmin } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.post("/get", authMiddleware, getUser);
userRouter.post("/create-admin", createAdmin); // Endpoint to create/update admin user

export default userRouter;