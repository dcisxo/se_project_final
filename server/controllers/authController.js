import { hash as _hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { create, findUserByCredentials, findById } from "../models/User";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

const makeToken = (user) =>
  sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password, accessCode } = req.body;
    if (!name || !email || !password || !accessCode) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (accessCode !== process.env.ORG_ACCESS_CODE) {
      return res
        .status(403)
        .json({ message: "Invalid organization access code" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    const hash = await _hash(password, SALT_ROUNDS);
    const user = await create({ name, email, password: hash });
    const token = makeToken(user);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await findUserByCredentials(email, password);
    const token = makeToken(user);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export default { register, login, getCurrentUser };
