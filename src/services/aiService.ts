import OpenAI from "openai";

export interface IssueSummary {
  summary: string;
}

const summarySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
    },
  },
  required: ["summary"],
} as const;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

export async function generateIssueSummary(
  title: string,
  description: string,
): Promise<IssueSummary> {
  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are a technical issue summarization assistant. Summarize only the provided title and description. Preserve important technical details, use clear technical language, and produce a concise summary of one to three sentences. Do not invent causes or solutions, and do not diagnose the issue.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Title: ${title}\nDescription: ${description}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "issue_summary",
        strict: true,
        schema: summarySchema,
      },
    },
  });

  if (!response.output_text) {
    throw new Error("The AI returned an empty response");
  }

  let parsedResult: unknown;

  try {
    parsedResult = JSON.parse(response.output_text);
  } catch {
    throw new Error("The AI returned invalid structured output");
  }

  if (
    !parsedResult ||
    typeof parsedResult !== "object" ||
    typeof (parsedResult as { summary?: unknown }).summary !== "string" ||
    !(parsedResult as { summary: string }).summary.trim()
  ) {
    throw new Error("The AI returned an invalid summary");
  }

  return {
    summary: (parsedResult as { summary: string }).summary.trim(),
  };
}