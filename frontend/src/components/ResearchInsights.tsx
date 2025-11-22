"use client";

import {
  Lightbulb,
  Check,
  Building2,
  Sparkles,
  HelpCircle,
  Loader2,
} from "lucide-react";
import type { ColdReachInsights } from "@/hooks/useSSE";

interface ResearchInsightsProps {
  insights: ColdReachInsights;
  isLoading: boolean;
  status: string;
}

export default function ResearchInsights({
  insights,
  isLoading,
  status,
}: ResearchInsightsProps) {
  const hasAnyInsights =
    insights.fit_reasons.length > 0 ||
    insights.company_insights.length > 0 ||
    insights.unique_angle ||
    insights.curiosity_question;

  if (!hasAnyInsights && !isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Insights will appear here after generation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status indicator while loading */}
      {isLoading && status && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          <span className="text-sm text-gray-600">{status}</span>
        </div>
      )}

      {/* Top Fit Reasons */}
      {insights.fit_reasons.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 animate-fadeIn">
          <h3 className="text-xs font-semibold text-blue-800 uppercase mb-2 flex items-center gap-2">
            <Check className="w-3 h-3" />
            Top Fit Reasons
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            {insights.fit_reasons.map((reason, index) => (
              <li key={index} className="animate-slideIn">
                • {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Company Insights */}
      {insights.company_insights.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 animate-fadeIn">
          <h3 className="text-xs font-semibold text-purple-800 uppercase mb-2 flex items-center gap-2">
            <Building2 className="w-3 h-3" />
            Company Insights
          </h3>
          <ul className="text-sm text-purple-700 space-y-1">
            {insights.company_insights.map((insight, index) => (
              <li key={index} className="animate-slideIn">
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unique Angle */}
      {insights.unique_angle && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 animate-fadeIn">
          <h3 className="text-xs font-semibold text-amber-800 uppercase mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Unique Angle
          </h3>
          <p className="text-sm text-amber-700">{insights.unique_angle}</p>
        </div>
      )}

      {/* Curiosity Question */}
      {insights.curiosity_question && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 animate-fadeIn">
          <h3 className="text-xs font-semibold text-green-800 uppercase mb-2 flex items-center gap-2">
            <HelpCircle className="w-3 h-3" />
            Curiosity Question
          </h3>
          <p className="text-sm text-green-700">{insights.curiosity_question}</p>
        </div>
      )}
    </div>
  );
}
