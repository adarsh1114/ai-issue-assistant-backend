import mongoose from "mongoose";
import { Issue } from "../models/Issue";

export async function findSimilarIssues(
  issueId: string,
  embedding: number[],
): Promise<unknown[]> {
  return Issue.aggregate([
    {
      $vectorSearch: {
        index: "issue_embedding_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: 100,
      },
    },
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(issueId) },
      },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        category: 1,
        priority: 1,
        status: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);
}
