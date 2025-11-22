import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { parseDocument } from "../utils/pdf-parser.ts";
import {
  generateJobId,
  createJob,
  getJob,
  updateJobResult,
  getCachedInsights,
} from "../utils/research-cache.ts";
import {
  createColdReachAgent,
  generateEmailStream,
  regenerateEmailStream,
  type ColdReachResult,
  type ZypherAgent,
} from "../agent/coldreach-agent.ts";

// Create Hono app
const app = new Hono();

// Enable CORS for frontend
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// Singleton agent instance
let agentInstance: ZypherAgent | null = null;
let agentInitializing = false;
let agentInitError: Error | null = null;

// Initialize agent on module load
export async function initializeAgent(): Promise<void> {
  if (agentInstance || agentInitializing) return;

  agentInitializing = true;
  agentInitError = null;

  try {
    console.log("🤖 Initializing ColdReach Agent...");
    agentInstance = await createColdReachAgent();
    console.log("✅ Agent initialized successfully");
  } catch (error) {
    agentInitError = error instanceof Error ? error : new Error("Failed to initialize agent");
    console.error("❌ Agent initialization failed:", agentInitError.message);
  } finally {
    agentInitializing = false;
  }
}

export function getAgentStatus(): { ready: boolean; initializing: boolean; error: string | null } {
  return {
    ready: agentInstance !== null,
    initializing: agentInitializing,
    error: agentInitError?.message || null,
  };
}

async function getAgent(): Promise<ZypherAgent> {
  // If agent exists, return it
  if (agentInstance) {
    return agentInstance;
  }

  // If there was an init error, try again
  if (agentInitError) {
    await initializeAgent();
  }

  // Wait for initialization to complete
  while (agentInitializing) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (!agentInstance) {
    throw new Error(agentInitError?.message || "Agent not initialized");
  }

  return agentInstance;
}

// Request validation schemas
const generateSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required"),
  jdText: z.string().min(1, "Job description is required"),
  companyName: z.string().optional(),
  researchDepth: z.number().min(0).max(4).default(2),
});

// Health check endpoint
app.get("/health", (c) => {
  const agentStatus = getAgentStatus();
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    agent: agentStatus,
  });
});

// Agent status endpoint
app.get("/api/agent-status", (c) => {
  return c.json(getAgentStatus());
});

// Parse resume file
app.post("/api/parse-resume", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const buffer = await file.arrayBuffer();
    const result = await parseDocument(buffer, file.name);

    return c.json({
      success: true,
      text: result.text,
      fileName: result.fileName,
      fileType: result.fileType,
      pageCount: result.pageCount,
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to parse resume",
      },
      400
    );
  }
});

// Start email generation (returns jobId for SSE stream)
app.post("/api/generate", async (c) => {
  try {
    const body = await c.req.json();
    const validated = generateSchema.parse(body);

    const jobId = generateJobId();
    createJob(
      jobId,
      validated.resumeText,
      validated.jdText,
      validated.companyName
    );

    return c.json({
      success: true,
      jobId,
      message: "Job created. Connect to SSE stream to receive updates.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.errors }, 400);
    }
    console.error("Generation start error:", error);
    return c.json({ error: "Failed to start generation" }, 500);
  }
});

// SSE stream for real-time updates
app.get("/api/stream/:jobId", async (c) => {
  const jobId = c.req.param("jobId");
  const job = getJob(jobId);

  if (!job) {
    return c.json({ error: "Job not found or expired" }, 404);
  }

  // Get research depth from query param (default 2)
  const researchDepth = parseInt(c.req.query("depth") || "2", 10);

  return streamSSE(c, async (stream) => {
    try {
      // Send initial connection event
      await stream.writeSSE({
        data: JSON.stringify({ type: "connected", jobId }),
        event: "message",
      });

      // Check if agent is initializing and send status updates
      const status = getAgentStatus();
      if (!status.ready && status.initializing) {
        await stream.writeSSE({
          data: JSON.stringify({ type: "status", data: "Initializing AI agent (first run may take a moment)..." }),
          event: "message",
        });
      }

      const agent = await getAgent();

      // Stream generation events
      for await (const event of generateEmailStream(
        agent,
        job.resumeText,
        job.jdText,
        job.companyName,
        researchDepth
      )) {
        await stream.writeSSE({
          data: JSON.stringify(event),
          event: "message",
        });

        // Cache the result when complete
        if (event.type === "complete" && typeof event.data === "object") {
          updateJobResult(jobId, event.data as ColdReachResult);
        }
      }

      // Send done event
      await stream.writeSSE({
        data: JSON.stringify({ type: "done" }),
        event: "message",
      });
    } catch (error) {
      console.error("SSE stream error:", error);
      await stream.writeSSE({
        data: JSON.stringify({
          type: "error",
          data: error instanceof Error ? error.message : "Stream error",
        }),
        event: "message",
      });
    }
  });
});

// Regenerate email with cached research
app.post("/api/regenerate/:jobId", async (c) => {
  const jobId = c.req.param("jobId");
  const job = getJob(jobId);

  if (!job) {
    return c.json({ error: "Job not found or expired" }, 404);
  }

  const insights = getCachedInsights(jobId);
  if (!insights) {
    return c.json(
      { error: "No cached insights found. Please generate a new email." },
      400
    );
  }

  return streamSSE(c, async (stream) => {
    try {
      const agent = await getAgent();

      await stream.writeSSE({
        data: JSON.stringify({ type: "connected", jobId }),
        event: "message",
      });

      for await (const event of regenerateEmailStream(
        agent,
        job.resumeText,
        job.jdText,
        insights
      )) {
        await stream.writeSSE({
          data: JSON.stringify(event),
          event: "message",
        });

        if (event.type === "complete" && typeof event.data === "object") {
          updateJobResult(jobId, event.data as ColdReachResult);
        }
      }

      await stream.writeSSE({
        data: JSON.stringify({ type: "done" }),
        event: "message",
      });
    } catch (error) {
      console.error("Regenerate error:", error);
      await stream.writeSSE({
        data: JSON.stringify({
          type: "error",
          data: error instanceof Error ? error.message : "Regeneration error",
        }),
        event: "message",
      });
    }
  });
});

// Fetch job description from URL using Firecrawl
app.post("/api/fetch-jd", async (c) => {
  try {
    const { url } = await c.req.json();

    if (!url || typeof url !== "string") {
      return c.json({ error: "URL is required" }, 400);
    }

    // We'll use the agent's Firecrawl to fetch the JD
    const agent = await getAgent();

    // Create a simple task to extract JD text from URL
    const taskPrompt = `Use Firecrawl to scrape this URL and extract the job description text: ${url}

Return ONLY the job description text, nothing else. If you can't find a job description, return an error message.`;

    // This is a simplified approach - in production you might want to
    // call Firecrawl directly or use a dedicated tool
    const result = await new Promise<string>((resolve, reject) => {
      let fullText = "";
      const timeout = setTimeout(() => {
        reject(new Error("Timeout fetching job description"));
      }, 30000);

      (async () => {
        try {
          const { eachValueFrom } = await import("rxjs-for-await");
          const event$ = agent.runTask(taskPrompt, "claude-3-5-haiku-20241022");

          for await (const event of eachValueFrom(event$)) {
            if (event.type === "text") {
              fullText += event.content.text || "";
            }
          }

          clearTimeout(timeout);
          resolve(fullText);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      })();
    });

    return c.json({
      success: true,
      text: result.trim(),
      url,
    });
  } catch (error) {
    console.error("Fetch JD error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch job description",
      },
      500
    );
  }
});

export default app;
