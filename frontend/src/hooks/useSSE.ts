"use client";

import { useState, useCallback, useRef } from "react";

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
  type: "connected" | "status" | "insight" | "tool_use" | "email" | "complete" | "error" | "done";
  category?: string;
  data?: string | ColdReachResult;
  jobId?: string;
}

export interface UseSSEReturn {
  // State
  isConnected: boolean;
  isLoading: boolean;
  status: string;
  insights: ColdReachInsights;
  email: string;
  result: ColdReachResult | null;
  error: string | null;

  // Actions
  connect: (url: string) => void;
  disconnect: () => void;
  reset: () => void;
}

const initialInsights: ColdReachInsights = {
  fit_reasons: [],
  company_insights: [],
  unique_angle: "",
  curiosity_question: "",
};

export function useSSE(): UseSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [insights, setInsights] = useState<ColdReachInsights>(initialInsights);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ColdReachResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const reset = useCallback(() => {
    setIsConnected(false);
    setIsLoading(false);
    setStatus("");
    setInsights(initialInsights);
    setEmail("");
    setResult(null);
    setError(null);
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setIsLoading(false);
  }, []);

  const connect = useCallback((url: string) => {
    // Clean up any existing connection
    disconnect();
    reset();
    setIsLoading(true);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setStatus("Connected to server...");
            break;

          case "status":
            setStatus(data.data as string);
            break;

          case "tool_use":
            setStatus(data.data as string);
            break;

          case "insight":
            setInsights((prev) => {
              const newInsights = { ...prev };
              const insightText = data.data as string;

              switch (data.category) {
                case "fit_reason":
                  newInsights.fit_reasons = [...prev.fit_reasons, insightText];
                  break;
                case "company_insight":
                  newInsights.company_insights = [...prev.company_insights, insightText];
                  break;
                case "unique_angle":
                  newInsights.unique_angle = insightText;
                  break;
                case "curiosity_question":
                  newInsights.curiosity_question = insightText;
                  break;
              }

              return newInsights;
            });
            break;

          case "email":
            setEmail(data.data as string);
            setStatus("Email generated!");
            break;

          case "complete":
            setResult(data.data as ColdReachResult);
            setIsLoading(false);
            setStatus("Complete!");
            break;

          case "error":
            setError(data.data as string);
            setIsLoading(false);
            break;

          case "done":
            setIsLoading(false);
            disconnect();
            break;
        }
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Connection lost. Please try again.");
      setIsLoading(false);
      disconnect();
    };
  }, [disconnect, reset]);

  return {
    isConnected,
    isLoading,
    status,
    insights,
    email,
    result,
    error,
    connect,
    disconnect,
    reset,
  };
}
