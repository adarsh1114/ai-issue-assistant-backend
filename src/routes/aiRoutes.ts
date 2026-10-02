import { Router } from "express";
import { generateSummary, testEmbedding } from "../controllers/aiController";

const aiRoutes = Router();

aiRoutes.post("/summarize", generateSummary);
aiRoutes.post("/embedding-test", testEmbedding);

export default aiRoutes;