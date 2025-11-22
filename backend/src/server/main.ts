import app, { initializeAgent } from "./routes.ts";
import { cleanupExpiredJobs } from "../utils/research-cache.ts";

// Load environment variables from .env file
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000", 10);

// Periodic cache cleanup (every 15 minutes)
setInterval(() => {
  const cleaned = cleanupExpiredJobs();
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired jobs`);
  }
}, 15 * 60 * 1000);

// Log cache stats on startup
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 ColdReach Agent Backend                              ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /health           - Health check                 ║
║   • POST /api/parse-resume - Parse PDF/DOCX resume        ║
║   • POST /api/generate     - Start email generation       ║
║   • GET  /api/stream/:id   - SSE stream for updates       ║
║   • POST /api/regenerate/:id - Regenerate with cache      ║
║   • POST /api/fetch-jd     - Fetch JD from URL            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

console.log(`📍 Server starting on http://localhost:${PORT}`);

// Start the server
Deno.serve({ port: PORT }, app.fetch);

// Pre-initialize the agent in the background (don't block server startup)
initializeAgent().catch((error) => {
  console.error("Background agent initialization failed:", error);
});
