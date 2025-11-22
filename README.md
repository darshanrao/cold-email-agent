# ColdReach Agent

AI-powered personalized cold email generator for job seekers targeting founders and hiring managers. Built with Zypher Agent framework and Next.js.

## Features

- **Resume Parsing**: Upload PDF/DOCX or paste text
- **Live Company Research**: Uses Firecrawl to research companies in real-time
- **Real-time Streaming**: See research insights as they're discovered via SSE
- **Personalized Emails**: 120-150 word emails grounded in actual research
- **Research Depth Control**: From quick (1-2 sources) to deep (5+ sources)

## Architecture

```
┌─────────────────┐         ┌──────────────────────────┐
│   Next.js App   │  HTTP   │   Deno Backend (Hono)    │
│   (Frontend)    │◄──────►│   + Zypher Agent         │
│   Port: 3000    │   SSE   │   Port: 8000             │
└─────────────────┘         └──────────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  Firecrawl MCP   │
                            │  (Web Research)  │
                            └──────────────────┘
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/cold-email-agent.git
cd cold-email-agent

# Setup Backend
cd backend
cp .env.example .env
# Add your API keys to .env (ANTHROPIC_API_KEY, FIRECRAWL_API_KEY)

# Setup Frontend
cd ../frontend
npm install
cp .env.local.example .env.local

# Run (in separate terminals)
# Terminal 1 - Backend
cd backend && deno task dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open http://localhost:3000

## Prerequisites

- [Deno 2.0+](https://deno.land/) - `curl -fsSL https://deno.land/install.sh | sh`
- [Node.js 18+](https://nodejs.org/)
- [Anthropic API Key](https://console.anthropic.com/) - For Claude Sonnet 4
- [Firecrawl API Key](https://firecrawl.dev/) - For web research

## Detailed Setup

### 1. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
FIRECRAWL_API_KEY=fc-your-key-here
PORT=8000
```

### 2. Frontend Configuration

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run the Application

**Terminal 1 - Start Backend** (must start first):
```bash
cd backend
deno task dev
```
Wait for: `Agent initialized successfully`

**Terminal 2 - Start Frontend**:
```bash
cd frontend
npm run dev
```

Open http://localhost:3000

## Usage

1. **Upload Resume**: Upload PDF/DOCX or paste your resume text
2. **Add Job Description**: Paste the JD or enter URL to auto-fetch
3. **Set Research Depth**: Quick (fast) to Max (thorough)
4. **Generate**: Click "Generate Personalized Email"
5. **Watch Live**: See research insights appear in real-time
6. **Copy & Send**: Copy the generated email

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/parse-resume` | Parse PDF/DOCX file |
| POST | `/api/generate` | Start email generation |
| GET | `/api/stream/:jobId` | SSE stream for updates |
| POST | `/api/fetch-jd` | Fetch JD from URL |

## Tech Stack

- **Backend**: Deno 2.0, Zypher Agent Framework, Hono
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **AI Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **MCP**: Firecrawl (web search & scraping)

## Project Structure

```
cold-email-agent/
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── coldreach-agent.ts   # Zypher agent
│   │   │   └── prompts.ts           # System prompts
│   │   ├── server/
│   │   │   ├── main.ts              # Entry point
│   │   │   └── routes.ts            # API routes
│   │   └── utils/
│   │       ├── pdf-parser.ts        # Document parsing
│   │       └── research-cache.ts    # Job caching
│   └── deno.json
├── frontend/
│   ├── src/
│   │   ├── app/page.tsx             # Main UI
│   │   ├── components/              # React components
│   │   ├── hooks/useSSE.ts          # SSE hook
│   │   └── lib/api.ts               # API client
│   └── package.json
└── README.md
```

## License

MIT
