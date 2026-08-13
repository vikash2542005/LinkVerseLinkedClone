import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/users.routes.js";

dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(postRoutes);
app.use(userRoutes);

app.use(express.static("uploads"))



const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://heyvikash2005_db_user:0MyWa300uLQtDPDt@linkverse.wnma0qk.mongodb.net/");
        console.log("Connected to MongoDB");

        app.listen(8000, () => {
            console.log("Server is running on port 8000");
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

start();


