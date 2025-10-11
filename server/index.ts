import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  // Serve static files or use Vite in dev mode
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use dynamic host/port
  const PORT = parseInt(process.env.PORT || "5000", 10);
  const HOST = process.env.HOST || "127.0.0.1";

  try {
    server.listen(PORT, HOST, () => {
      log(`🚀 Server running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    log(`❌ Cannot bind to ${HOST}:${PORT}, trying localhost`);
    server.listen(PORT, () => {
      log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
})();
