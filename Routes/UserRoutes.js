import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleWare.js";
import User from "../Models/UserModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

const userRouter = express.Router();

userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });
    const comparePass = user && bcrypt.compare(password, user.password);
    if (comparePass) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error("Email và mật khẩu không chính xác. Vui lòng nhập lại !");
    }
  })
);

userRouter.post(
  "/register",

  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({
      email,
    });
    if (userExists) {
      res.status(400);
      throw new Error(
        "Tài khoản đã tồn tại, vui lòng đăng ký tài khoản khác !"
      );
    }
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("User data is invalid");
    }
  })
);

userRouter.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found !");
    }
  })
);

userRouter.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.isAdmin = req.body.isAdmin || user.isAdmin;
      const updateUser = await user.save();
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        phone: updateUser.phone,
        isAdmin: updateUser.isAdmin,
        createdAt: updateUser.createdAt,
        token: generateToken(updateUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found !");
    }
  })
);

// GET ALL USER ADMIN
userRouter.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

export default userRouter;
