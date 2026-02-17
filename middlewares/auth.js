import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import tokenBlackList from "../models/tokenBlackList.model.js";

dotenv.config();

export default async function auth(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Token manquant" });
        }

        const token = header.split(" ")[1];

        const blacklisted = await tokenBlackList.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ success: false, message: "Token blacklisté" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Token invalide" });
    }
}
