import type { Issue } from "../models/Issue";

const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const GEMINI_EMBEDDING_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent`;

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: unknown;
  };
};

export function buildIssueEmbeddingText(issue: Issue): string {
  return [
    `Title: ${issue.title}`,
    `Description: ${issue.description}`,
    `Category: ${issue.category}`,
    `Priority: ${issue.priority}`,
    `Status: ${issue.status}`,
    `Created by: ${issue.createdBy}`,
  ].join("\n");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const response = await fetch(`${GEMINI_EMBEDDING_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini embedding request failed (${response.status}): ${errorBody}`);
    }

    const result = (await response.json()) as GeminiEmbeddingResponse;
    const values = result.embedding?.values;

    if (
      !Array.isArray(values) ||
      values.length === 0 ||
      !values.every(
        (value): value is number =>
          typeof value === "number" && Number.isFinite(value),
      )
    ) {
      throw new Error("Gemini returned an invalid embedding vector");
    }

    return values;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Gemini ")) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Gemini embedding request failed: ${message}`);
  }
}
