import { ZypherAgent, AnthropicModelProvider, createZypherContext } from "@corespeed/zypher";
import { eachValueFrom } from "rxjs-for-await";
import {
  COLDREACH_SYSTEM_PROMPT,
  buildGenerationPrompt,
  buildRegeneratePrompt,
} from "./prompts.ts";

// Re-export ZypherAgent type for use in other modules
export type { ZypherAgent };

// Types for the agent output
export interface ColdReachInsights {
  fit_reasons: string[];
  company_insights: string[];
  unique_angle: string;
  curiosity_question: string;
}

export interface ColdReachEmail {
  subject: string;
  body: string;
}

export interface ColdReachResult {
  insights: ColdReachInsights;
  email: ColdReachEmail;
  metadata: {
    company_name: string;
    role_title: string;
    word_count: number;
  };
}

export interface StreamEvent {
  type: "status" | "insight" | "tool_use" | "email" | "complete" | "error";
  category?: string;
  data: string | ColdReachResult;
}

// Get required environment variable or throw
function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Create and initialize the Zypher agent
export async function createColdReachAgent(): Promise<ZypherAgent> {
  // Initialize the agent execution context (required for MCP support)
  const zypherContext = await createZypherContext(Deno.cwd());

  // Create the agent with context and LLM provider
  const agent = new ZypherAgent(
    zypherContext,
    new AnthropicModelProvider({
      apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
    })
  );

  // Register Firecrawl MCP server for web research
  // Using agent.mcp (not agent.mcpServerManager)
  await agent.mcp.registerServer({
    id: "firecrawl",
    type: "command",
    command: {
      command: "npx",
      args: ["-y", "firecrawl-mcp"],
      env: {
        FIRECRAWL_API_KEY: getRequiredEnv("FIRECRAWL_API_KEY"),
      },
    },
  });

  console.log("✅ Firecrawl MCP server registered successfully");

  // Wait for the MCP server to fully initialize and tools to be available
  console.log("⏳ Waiting for MCP server to fully initialize...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Log the MCP manager state for debugging
  console.log("📦 MCP manager properties:", Object.keys(agent.mcp || {}));

  // Try to access registered servers and their tools
  try {
    const mcpAny = agent.mcp as unknown as Record<string, unknown>;
    const context = mcpAny.context as Record<string, unknown>;
    if (context) {
      console.log("📦 MCP context properties:", Object.keys(context));
      // Look for mcpServerManager in context
      if (context.mcpServerManager) {
        const manager = context.mcpServerManager as Record<string, unknown>;
        console.log("📦 MCP server manager found:", Object.keys(manager));
      }
    }
  } catch (e) {
    console.log("Could not inspect MCP manager:", e);
  }

  return agent;
}

// Stream generator for SSE
export async function* generateEmailStream(
  agent: ZypherAgent,
  resumeText: string,
  jdText: string,
  companyName: string | undefined,
  researchDepth: number
): AsyncGenerator<StreamEvent> {
  const prompt = buildGenerationPrompt(resumeText, jdText, companyName, researchDepth);

  yield { type: "status", data: "Starting email generation..." };

  // Include system prompt in the task
  const fullPrompt = `${COLDREACH_SYSTEM_PROMPT}\n\n${prompt}`;
  // Use Claude Sonnet 4 for better tool usage and research quality
  const event$ = agent.runTask(fullPrompt, "claude-sonnet-4-20250514");

  let fullResponse = "";
  let lastToolName = "";

  for await (const event of eachValueFrom(event$)) {
    switch (event.type) {
      case "text":
        // For text events, content IS the text string directly
        fullResponse += event.content as string;
        break;

      case "tool_use": {
        // Tool is being called - name might be in content
        const eventAny = event as unknown as { content?: Record<string, unknown> };
        const toolContent = (eventAny.content || {}) as Record<string, unknown>;
        if (typeof toolContent.name === "string" && toolContent.name) {
          lastToolName = toolContent.name;
          // Map tool names to user-friendly messages
          const toolMessages: Record<string, string> = {
            firecrawl_search: "Searching for company information...",
            firecrawl_firecrawl_search: "Searching for company information...",
            firecrawl_scrape: "Crawling company website...",
            firecrawl_firecrawl_scrape: "Crawling company website...",
            firecrawl_crawl: "Deep crawling company pages...",
            firecrawl_map: "Mapping company site structure...",
          };
          const message = toolMessages[lastToolName] || `Researching: ${lastToolName}`;
          yield { type: "tool_use", data: message };
        }
        break;
      }

      case "tool_use_input":
        // Tool input being streamed - can extract query/url info
        break;

      case "tool_use_approved":
        // Tool execution approved
        if (lastToolName) {
          yield { type: "status", data: `Executing ${lastToolName}...` };
        }
        break;

      case "message":
        // Message boundary - ignore
        break;

      default:
        // Log unknown event types for debugging
        console.log("Unknown event type:", event.type);
        break;
    }
  }

  // Parse the final response
  try {
    // Extract JSON from the response (might be wrapped in markdown code blocks)
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
      fullResponse.match(/({[\s\S]*})/);

    if (jsonMatch && jsonMatch[1]) {
      const result: ColdReachResult = JSON.parse(jsonMatch[1]);

      // Emit insights one by one for progressive UI updates
      for (const reason of result.insights.fit_reasons) {
        yield { type: "insight", category: "fit_reason", data: reason };
      }

      for (const insight of result.insights.company_insights) {
        yield { type: "insight", category: "company_insight", data: insight };
      }

      yield {
        type: "insight",
        category: "unique_angle",
        data: result.insights.unique_angle,
      };

      yield {
        type: "insight",
        category: "curiosity_question",
        data: result.insights.curiosity_question,
      };

      yield { type: "email", data: result.email.body };

      yield { type: "complete", data: result };
    } else {
      throw new Error("Could not parse agent response as JSON");
    }
  } catch (error) {
    yield {
      type: "error",
      data: `Failed to parse response: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Regenerate email with cached insights (no new research)
export async function* regenerateEmailStream(
  agent: ZypherAgent,
  resumeText: string,
  jdText: string,
  previousInsights: ColdReachInsights
): AsyncGenerator<StreamEvent> {
  const prompt = buildRegeneratePrompt(resumeText, jdText, previousInsights);

  yield { type: "status", data: "Regenerating email with cached research..." };

  // Include system prompt in the task
  const fullPrompt = `${COLDREACH_SYSTEM_PROMPT}\n\n${prompt}`;
  // Use Claude Sonnet 4 for better tool usage and research quality
  const event$ = agent.runTask(fullPrompt, "claude-sonnet-4-20250514");

  let fullResponse = "";

  for await (const event of eachValueFrom(event$)) {
    if (event.type === "text") {
      // For text events, content IS the text string directly
      fullResponse += event.content as string;
    }
  }

  // Parse the final response
  try {
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
      fullResponse.match(/({[\s\S]*})/);

    if (jsonMatch && jsonMatch[1]) {
      const result: ColdReachResult = JSON.parse(jsonMatch[1]);
      yield { type: "email", data: result.email.body };
      yield { type: "complete", data: result };
    } else {
      throw new Error("Could not parse agent response as JSON");
    }
  } catch (error) {
    yield {
      type: "error",
      data: `Failed to parse response: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
