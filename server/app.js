require("dotenv").config();

import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicantRoutes from "./routes/applicantRoutes";
import publicRoutes from "./routes/publicRoutes";
import { getAllApplicants } from "./controllers/applicantController";
import auth from "./middleware/auth";
import errorHandler from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hirerank";

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(json());

// Routes
app.use("/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api", jobRoutes);
app.get("/api/applicants", auth, getAllApplicants);
app.use("/api/jobs/:jobId/applicants", applicantRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler (must be last)
app.use(errorHandler);

connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
