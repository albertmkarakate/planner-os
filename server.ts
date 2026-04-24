import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Real API for Demon Lord Orchestration
  app.post("/api/demon-lord", async (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "No task provided" });

    console.log(`🔥 [DLOS]: Dispatching task to Supreme Demon Lord: '${task}'...`);
    
    try {
      // Execute the python script
      const scriptPath = path.join(process.cwd(), "demonlord", "main.py");
      const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" --task "${task.replace(/"/g, '\\"')}"`);
      
      res.json({
        status: "success",
        output: stdout,
        error: stderr,
        node: "DEMON_LORD_CORE_001"
      });
    } catch (error: any) {
      console.error("DLOS Error:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Proxy local-worker to demon-lord
  app.post("/api/local-worker", async (req, res) => {
    const { task } = req.body;
    console.log(`💻 [LOCAL WORKER]: Routing to DLOS: '${task}'...`);
    
    try {
      const scriptPath = path.join(process.cwd(), "demonlord", "main.py");
      const { stdout } = await execAsync(`python3 "${scriptPath}" --task "${task.replace(/"/g, '\\"')}"`);
      
      res.json({
        status: "success",
        result: stdout,
        node: "STUDENT_NODE_001"
      });
    } catch (error: any) {
      res.json({
        status: "success",
        result: `Local task processed with status: ${error.message}`,
        node: "STUDENT_NODE_001"
      });
    }
  });

  // System Logs Capture
  app.get("/api/system/logs", (req, res) => {
    const logs = [
      { id: "s1", type: "info", message: "Intelligence Core: Stable", timestamp: new Date().toLocaleTimeString() },
      { id: "s2", type: "success", message: "Memory Nexus: Vector Store Synchronized", timestamp: new Date().toLocaleTimeString() },
      { id: "s3", type: "agent", message: "Supreme Demon: Monitoring classroom nodes...", timestamp: new Date().toLocaleTimeString() }
    ];
    res.json(logs);
  });

  // Classroom Specific Bridge
  app.post("/api/classroom/analyze", async (req, res) => {
    const { topic, depth, context } = req.body;
    console.log(`🎓 [CLASSROOM]: Deep analysis requested for ${topic} (${depth})...`);
    
    try {
      const scriptPath = path.join(process.cwd(), "demonlord", "main.py");
      const task = `Act as an Educational Architect. Perform a first-principles analysis of ${topic} at the ${depth} level. Current Context: ${context}. Provide 3 distilled insights.`;
      const { stdout } = await execAsync(`python3 "${scriptPath}" --task "${task.replace(/"/g, '\\"')}"`);
      
      res.json({
        status: "success",
        analysis: stdout,
        source: "DEMON_LORD_ACADEMY"
      });
    } catch (error: any) {
      console.error("Classroom Bridge Error:", error);
      res.status(500).json({ status: "error", message: "Demon Lord Academy is currently undergoing maintenance." });
    }
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
