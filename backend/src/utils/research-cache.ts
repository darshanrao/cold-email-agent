import type { ColdReachInsights, ColdReachResult } from "../agent/coldreach-agent.ts";

interface CachedJob {
  jobId: string;
  resumeText: string;
  jdText: string;
  companyName?: string;
  result?: ColdReachResult;
  insights?: ColdReachInsights;
  createdAt: number;
}

// In-memory cache for job results (enables regenerate without re-research)
const jobCache = new Map<string, CachedJob>();

// Cache TTL: 1 hour
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Generate a unique job ID
 */
export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new job entry in cache
 */
export function createJob(
  jobId: string,
  resumeText: string,
  jdText: string,
  companyName?: string
): CachedJob {
  const job: CachedJob = {
    jobId,
    resumeText,
    jdText,
    companyName,
    createdAt: Date.now(),
  };
  jobCache.set(jobId, job);
  return job;
}

/**
 * Get a job from cache
 */
export function getJob(jobId: string): CachedJob | undefined {
  const job = jobCache.get(jobId);
  if (job && Date.now() - job.createdAt > CACHE_TTL) {
    // Job has expired
    jobCache.delete(jobId);
    return undefined;
  }
  return job;
}

/**
 * Update job with result and insights
 */
export function updateJobResult(jobId: string, result: ColdReachResult): void {
  const job = jobCache.get(jobId);
  if (job) {
    job.result = result;
    job.insights = result.insights;
  }
}

/**
 * Get cached insights for regeneration
 */
export function getCachedInsights(jobId: string): ColdReachInsights | undefined {
  const job = getJob(jobId);
  return job?.insights;
}

/**
 * Clean up expired jobs (call periodically)
 */
export function cleanupExpiredJobs(): number {
  let cleaned = 0;
  const now = Date.now();

  for (const [jobId, job] of jobCache.entries()) {
    if (now - job.createdAt > CACHE_TTL) {
      jobCache.delete(jobId);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get cache stats
 */
export function getCacheStats(): { size: number; oldestJob: number | null } {
  let oldestJob: number | null = null;

  for (const job of jobCache.values()) {
    if (oldestJob === null || job.createdAt < oldestJob) {
      oldestJob = job.createdAt;
    }
  }

  return {
    size: jobCache.size,
    oldestJob,
  };
}
