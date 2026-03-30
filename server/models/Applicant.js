import { Schema, model } from "mongoose";

const applicantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    experienceYears: { type: Number, required: true, min: 0 },
    skills: { type: [String], default: [] },
    industry: { type: String, trim: true, default: "" },
    currentCompany: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    linkedinUrl: { type: String, trim: true, default: "" },
    coverLetter: { type: String, trim: true, default: "" },
    githubOrg: { type: String, trim: true, default: "" },
    companySignalsScore: { type: Number, default: null },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "interview", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default model("Applicant", applicantSchema);
