import "dotenv/config";

import express from "express";
import { connect } from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicantRoutes from "./routes/applicantRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { getAllApplicants } from "./controllers/applicantController.js";
import auth from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;
const { MONGO_URI, CLIENT_ORIGIN } = process.env;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

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
