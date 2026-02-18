import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function authOptional(req, res, next) {
  const header = req.headers.authorization;

  // pas de token => public
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
  } catch (e) {
  }

  next();
}
