import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDatabase } from "./config/database";
import aiRoutes from "./routes/aiRoutes";
import issueRoutes from "./routes/issueRoutes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (_request, response) => {
  response.json({
    success: true,
    message: "AI Issue Assistant API is running",
  });
});

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
