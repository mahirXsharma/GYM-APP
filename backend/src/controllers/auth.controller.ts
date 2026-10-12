import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signupSchema, loginSchema } from "../validators/auth.validators.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const { name, email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const User = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    // sending back a jwt token
    const token = jwt.sign(
      {
        id: User.id,
        name: User.name,
        email: User.email,
        isAdmin:User.isAdmin
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: User.id,
        name: User.name,
        email: User.email,
      },
    });
    
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error", details: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin:user.isAdmin
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin:user.isAdmin
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error", details: (error as Error).message });
  }
};
