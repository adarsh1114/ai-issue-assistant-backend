import { Router } from "express";
import {
	createIssue,
	deleteIssue,
	getIssueById,
	getIssues,
	getSimilarIssues,
	updateIssue,
} from "../controllers/issueController";

const issueRoutes = Router();

issueRoutes.post("/", createIssue);
issueRoutes.get("/", getIssues);
issueRoutes.get("/:id/similar", getSimilarIssues);
issueRoutes.get("/:id", getIssueById);
issueRoutes.put("/:id", updateIssue);
issueRoutes.delete("/:id", deleteIssue);

export default issueRoutes;