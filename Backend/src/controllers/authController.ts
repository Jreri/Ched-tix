import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users, User } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register (student role by default)
export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    role: "student"
  };

  users.push(newUser);
  res.status(201).json({ message: "User registered", user: newUser.username });
};

// Login
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, role: user.role });
};
