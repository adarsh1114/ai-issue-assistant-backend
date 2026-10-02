import { Request, Response } from "express";
import mongoose from "mongoose";
import { Issue, IssueDocument } from "../models/Issue";
import {
  buildIssueEmbeddingText,
  generateEmbedding,
} from "../services/embeddingService";
import { findSimilarIssues } from "../services/similarIssueService";

export async function createIssue(
  request: Request,
  response: Response,
): Promise<void> {
  const { title, description, category, priority, createdBy } = request.body;

  if (!title || !description || !category || !priority || !createdBy) {
    response.status(400).json({
      success: false,
      message: "Required fields are missing",
    });
    return;
  }

  let issue: IssueDocument | undefined;

  try {
    issue = await Issue.create({
      title,
      description,
      category,
      priority,
      createdBy,
    });

    const embeddingText = buildIssueEmbeddingText(issue);
    issue.embedding = await generateEmbedding(embeddingText);
    await issue.save();

    response.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    if (issue) {
      try {
        await Issue.findByIdAndDelete(issue._id);
      } catch (_cleanupError) {}
    }

    if (error instanceof mongoose.Error.ValidationError) {
      response.status(400).json({
        success: false,
        message: `Validation failed: ${Object.values(error.errors)
          .map((validationError) => validationError.message)
          .join(", ")}`,
      });
      return;
    }

    response.status(500).json({
      success: false,
      message: "Failed to create issue with embedding",
    });
  }
}

export async function getIssues(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });

    response.status(200).json({
      success: true,
      data: issues,
    });
  } catch (_error) {
    response.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
}

export async function getIssueById(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({
      success: false,
      message: "Invalid issue ID",
    });
    return;
  }

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      response.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: issue,
    });
  } catch (_error) {
    response.status(500).json({
      success: false,
      message: "Failed to fetch issue",
    });
  }
}

export async function getSimilarIssues(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({
      success: false,
      message: "Invalid issue ID",
    });
    return;
  }

  try {
    const issue = await Issue.findById(id).select("embedding");

    if (!issue) {
      response.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }

    const embedding = issue.embedding;
    if (
      !Array.isArray(embedding) ||
      embedding.length === 0 ||
      !embedding.every(
        (value): value is number =>
          typeof value === "number" && Number.isFinite(value),
      )
    ) {
      response.status(400).json({
        success: false,
        message: "Issue does not have a valid embedding",
      });
      return;
    }

    const similarIssues = await findSimilarIssues(id, embedding);

    response.status(200).json({
      success: true,
      data: similarIssues,
    });
  } catch (_error) {
    response.status(500).json({
      success: false,
      message: "Failed to find similar issues",
    });
  }
}

export async function updateIssue(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({
      success: false,
      message: "Invalid issue ID",
    });
    return;
  }

  const updateFields = ["title", "description", "category", "priority", "status"];
  const updates: Record<string, unknown> = {};

  for (const field of updateFields) {
    if (request.body?.[field] !== undefined) {
      updates[field] = request.body[field];
    }
  }

  let shouldRegenerateEmbedding = false;

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      response.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }

    const embeddingFields: Array<"title" | "description" | "category"> = [
      "title",
      "description",
      "category",
    ];
    shouldRegenerateEmbedding = embeddingFields.some(
      (field) => updates[field] !== undefined && updates[field] !== issue[field],
    );

    issue.set(updates);

    if (shouldRegenerateEmbedding) {
      const embeddingText = buildIssueEmbeddingText(issue);
      issue.embedding = await generateEmbedding(embeddingText);
    }

    await issue.save();

    response.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      response.status(400).json({
        success: false,
        message: `Validation failed: ${Object.values(error.errors)
          .map((validationError) => validationError.message)
          .join(", ")}`,
      });
      return;
    }

    response.status(500).json({
      success: false,
      message: shouldRegenerateEmbedding
        ? "Failed to update issue with embedding"
        : "Failed to update issue",
    });
  }
}

export async function deleteIssue(
  request: Request,
  response: Response,
): Promise<void> {
  const { id } = request.params;

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({
      success: false,
      message: "Invalid issue ID",
    });
    return;
  }

  try {
    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      response.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (_error) {
    response.status(500).json({
      success: false,
      message: "Failed to delete issue",
    });
  }
}