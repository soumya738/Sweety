import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js"

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await prisma.user.findUnique({
        where: { email: email },
    });


    if (userExists) {
        return res.status(400).json({ error: "User already exists with this email" });
    }

    //Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    // adding user to table

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email,
            },
            token,
        },
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email: email },
    });


    if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid username or password" })
    }

    // JWT 
    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: email,
            },
            token,
        },
    });
}

const logout = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        status: "success",
        message: "Logged out successfully",
    });
};

// GET /auth/me — returns the current user from the JWT cookie
// Used by the frontend to restore session on page refresh
const me = async (req, res) => {
    // req.user is attached by the protect middleware
    res.status(200).json({
        status: "success",
        data: { user: req.user },
    });
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body ?? {};
        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({ error: "Current and new passwords are required." });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ error: "Your new password must be different from your current password." });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, password: true },
        });

        if (!user) {
            return res.status(401).json({ error: "Not authorized, user no longer exists." });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return res.status(200).json({
            status: "success",
            message: "Password updated successfully.",
        });
    } catch (error) {
        console.error("updatePassword error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export { register, login, logout, me, updatePassword };
