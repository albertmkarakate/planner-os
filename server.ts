import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API for "Local Worker" (Worker AI)
  app.post("/api/local-worker", (req, res) => {
    const { task } = req.body;
    console.log(`💻 [LOCAL WORKER]: Executing heavy task: '${task}'...`);
    
    // Simulate thinking
    setTimeout(() => {
      res.json({
        status: "success",
        result: `Local sync complete for: ${task}. Privacy preserved on student node.`,
        node: "STUDENT_NODE_001"
      });
    }, 1200);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "hybrid-ai" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`AI Intelligence: Hybrid Mode (Gemini Cloud + Local Proxy)`);
  });
}

startServer();
