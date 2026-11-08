import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ error: "Not authorized, no token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return res.status(401).json({ error: "Not authorized, user no longer exists" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Not authorized, invalid token" });
    }
};
