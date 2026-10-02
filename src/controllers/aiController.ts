import { Request, Response } from "express";
import { generateIssueSummary } from "../services/aiService";
import { generateEmbedding } from "../services/embeddingService";

export async function generateSummary(
  request: Request,
  response: Response,
): Promise<void> {
  const { title, description } = request.body ?? {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    response.status(400).json({
      success: false,
      message: "Title and description are required",
    });
    return;
  }

  try {
    const summary = await generateIssueSummary(
      title.trim(),
      description.trim(),
    );

    response.status(200).json({
      success: true,
      data: summary,
    });
  } catch (_error) {
    response.status(500).json({
      success: false,
      message: "Failed to summarize issue",
    });
  }
}

export async function testEmbedding(
  request: Request,
  response: Response,
): Promise<void> {
  const { text } = request.body ?? {};

  if (typeof text !== "string" || !text.trim()) {
    response.status(400).json({
      success: false,
      message: "Text is required",
    });
    return;
  }

  try {
    const embedding = await generateEmbedding(text.trim());

    response.status(200).json({
      success: true,
      data: {
        embedding,
      },
    });
  } catch (_error) {
    response.status(500).json({
      success: false,
      message: "Failed to generate embedding",
    });
  }
}