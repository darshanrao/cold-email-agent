"use client";

import { useState, useCallback } from "react";
import { Mail, Copy, Check } from "lucide-react";

interface EmailOutputProps {
  email: string;
  isLoading: boolean;
}

export default function EmailOutput({
  email,
  isLoading,
}: EmailOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [email]);

  if (!email && !isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Your email will appear here</p>
      </div>
    );
  }

  return (
    <div>
      {email ? (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {email}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Email
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Generating your email...</p>
        </div>
      )}
    </div>
  );
}
