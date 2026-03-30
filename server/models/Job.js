import { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: {
      minExperienceYears: { type: Number, required: true, min: 0 },
      requiredSkills: { type: [String], default: [] },
      preferredSkills: { type: [String], default: [] },
      industry: { type: String, required: true, trim: true },
    },
    weightConfig: {
      experience: { type: Number, default: 0.3 },
      skills: { type: Number, default: 0.4 },
      industryMatch: { type: Number, default: 0.2 },
      companySignals: { type: Number, default: 0.1 },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default model("Job", jobSchema);
