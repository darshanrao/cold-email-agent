interface CachedJob {
  jobId: string;
  resumeText: string;
  jdText: string;
  companyName?: string;
  createdAt: number;
}

// In-memory cache for job data
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
