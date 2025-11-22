"use client";

import { useState, useCallback } from "react";
import { Upload, Link, FileText, Loader2 } from "lucide-react";
import { fetchJobDescription } from "@/lib/api";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = useCallback(async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchJobDescription(url);
      onChange(result.text);
      setShowUrlInput(false);
      setUrl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch job description"
      );
    } finally {
      setIsLoading(false);
    }
  }, [url, onChange]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        onChange(text);
      } catch {
        setError("Failed to read file");
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {showUrlInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://careers.company.com/job/..."
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={isLoading || !url.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Fetch"
              )}
            </button>
          </div>
          <button
            onClick={() => {
              setShowUrlInput(false);
              setUrl("");
              setError(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload File
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowUrlInput(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Link className="w-4 h-4" />
            Enter URL
          </button>
        </div>
      )}
    </div>
  );
}
