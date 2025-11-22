"use client";

import { useState, useCallback } from "react";
import {
  Mail,
  User,
  FileText,
  Building2,
  Sparkles,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import ResearchDepthSlider from "@/components/ResearchDepthSlider";
import ResearchInsights from "@/components/ResearchInsights";
import EmailOutput from "@/components/EmailOutput";
import { useSSE } from "@/hooks/useSSE";
import { startGeneration, getStreamUrl } from "@/lib/api";

export default function ColdReachApp() {
  // Form state
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [researchDepth, setResearchDepth] = useState(2);

  // SSE hook for streaming
  const {
    isLoading,
    status,
    insights,
    email,
    error,
    connect,
    reset,
  } = useSSE();

  // Handle resume upload
  const handleResumeText = useCallback((text: string, fileName: string) => {
    setResumeText(text);
    setResumeFileName(fileName);
  }, []);

  // Validate form
  const isFormValid = resumeText.trim() && jobDescription.trim();

  // Handle generate
  const handleGenerate = useCallback(async () => {
    if (!isFormValid) return;

    reset();

    try {
      const response = await startGeneration({
        resumeText,
        jdText: jobDescription,
        companyName: companyName || undefined,
        researchDepth,
      });

      const streamUrl = getStreamUrl(response.jobId, researchDepth);
      connect(streamUrl);
    } catch (err) {
      console.error("Failed to start generation:", err);
    }
  }, [
    isFormValid,
    resumeText,
    jobDescription,
    companyName,
    researchDepth,
    reset,
    connect,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ColdReach</h1>
        </div>
        <p className="text-gray-500 ml-13">
          AI-powered personalized cold emails for founders & hiring managers
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-5">
          {/* Resume Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Resume
            </h2>
            <ResumeUpload onResumeText={handleResumeText} />
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Job Description
            </h2>
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />
          </div>

          {/* Company Name */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name
              <span className="text-xs font-normal text-gray-400">(Optional)</span>
            </h2>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Selfin, Supplyco, Anthropic..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Research Depth */}
          <ResearchDepthSlider value={researchDepth} onChange={setResearchDepth} />

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !isFormValid}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Personalized Email
              </>
            )}
          </button>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Right Column - Outputs */}
        <div className="space-y-5">
          {/* Research Insights */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Research Insights
            </h2>
            <ResearchInsights
              insights={insights}
              isLoading={isLoading}
              status={status}
            />
          </div>

          {/* Email Output */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Your Personalized Email
            </h2>
            <EmailOutput
              email={email}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-8 text-center text-xs text-gray-400">
        ColdReach • Built for founders who value authenticity
      </div>
    </div>
  );
}
