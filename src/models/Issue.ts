import { HydratedDocument, model, Schema } from "mongoose";

export interface Issue {
  title: string;
  description: string;
  category:
    | "authentication"
    | "payment"
    | "tracking"
    | "database"
    | "api"
    | "frontend"
    | "backend"
    | "deployment"
    | "performance"
    | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdBy: string;
  embedding?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type IssueDocument = HydratedDocument<Issue>;

const issueSchema = new Schema<Issue>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "authentication",
        "payment",
        "tracking",
        "database",
        "api",
        "frontend",
        "backend",
        "deployment",
        "performance",
        "other",
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

export const Issue = model<Issue>("Issue", issueSchema);