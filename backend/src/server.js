import express from "express";
import { config } from "dotenv";
import {connectDB,disconnectDB} from "./config/db.js";

//Import Routes
import readingsroute from "./routes/readingsRoutes.js";
import registerRoute from "./routes/authRoutes.js";

config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//API Routes
app.use("/readings", readingsroute)
app.use("/auth", registerRoute)
 
const PORT = 5001;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection",(err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});