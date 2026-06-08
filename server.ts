import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import authRoutes from "./server/routes/auth";
import postRoutes from "./server/routes/posts";

dotenv.config();

const DEFAULT_MONGODB_URI = "mongodb+srv://awaazuser:1a2b3c4d5e6@awaaz.vfh0rbt.mongodb.net/awaaz?retryWrites=true&w=majority&appName=awaaz";

function getMongoUri() {
  const envUri = process.env.MONGODB_URI;
  if (envUri && (envUri.startsWith("mongodb://") || envUri.startsWith("mongodb+srv://"))) {
    return envUri.trim();
  }
  return DEFAULT_MONGODB_URI;
}

const MONGODB_URI = getMongoUri();
const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic Middleware
  app.use(cors());
  app.use(express.json());

  // MongoDB Connection
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected to Awaaz Database");

    // Optional: Seed initial posts if none exist
    const postCount = await mongoose.model("Post").countDocuments();
    if (postCount === 0) {
      const { Post } = await import("./server/models/Post");
      const { User } = await import("./server/models/User");
      
      // Create a dummy admin for seeding
      const dummyUser = new User({
        firstName: "Awaaz",
        lastName: "Admin",
        email: "admin@awaaz.com",
        phone: "0000000000",
        password: "nomatchpassword"
      });
      await dummyUser.save();

      await Post.create([
        {
          userId: dummyUser._id,
          userName: "Awaaz Community",
          content: "Welcome to Awaaz! A platform built for change. Share your thoughts, report issues, and build awareness.",
          category: "General",
          likes: [],
          comments: []
        },
        {
          userId: dummyUser._id,
          userName: "Social Watch",
          content: "Recent studies show that community-led initiatives are 3x more effective in solving local infrastructure issues.",
          category: "Education Reform",
          likes: [],
          comments: []
        }
      ]);
      console.log("Seed data created");
    }
  } catch (err) {
    console.error("MongoDB Connection Failed", err);
  }

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);

  // Serve static files (uploads) if any
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Awaaz application running at http://localhost:${PORT}`);
  });
}

startServer();
