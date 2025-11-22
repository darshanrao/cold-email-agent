"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Check, X } from "lucide-react";
import { parseResume } from "@/lib/api";

interface ResumeUploadProps {
  onResumeText: (text: string, fileName: string) => void;
}

export default function ResumeUpload({ onResumeText }: ResumeUploadProps) {
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await parseResume(file);
        setFileName(result.fileName);
        setIsUploaded(true);
        onResumeText(result.text, result.fileName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file");
      } finally {
        setIsLoading(false);
      }
    },
    [onResumeText]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handlePasteSubmit = useCallback(() => {
    if (pastedText.trim()) {
      setFileName("Pasted Resume");
      setIsUploaded(true);
      onResumeText(pastedText.trim(), "pasted-resume.txt");
      setShowPasteArea(false);
    }
  }, [pastedText, onResumeText]);

  const handleReset = useCallback(() => {
    setIsUploaded(false);
    setFileName("");
    setError(null);
    setPastedText("");
    setShowPasteArea(false);
  }, []);

  if (isUploaded) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">{fileName}</p>
          <p className="text-xs text-green-600">Successfully uploaded</p>
        </div>
        <Check className="w-5 h-5 text-green-600" />
        <button
          onClick={handleReset}
          className="p-1 hover:bg-green-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    );
  }

  if (showPasteArea) {
    return (
      <div className="space-y-3">
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste your resume text here..."
          className="w-full h-40 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim()}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            Use This Resume
          </button>
          <button
            onClick={() => setShowPasteArea(false)}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isLoading
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileSelect}
          className="hidden"
          id="resume-upload"
          disabled={isLoading}
        />
        <label htmlFor="resume-upload" className="cursor-pointer">
          {isLoading ? (
            <>
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-indigo-600 font-medium">Parsing resume...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                Upload PDF / DOCX / TXT
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Drag & drop or click to browse
              </p>
            </>
          )}
        </label>
      </div>

      <button
        onClick={() => setShowPasteArea(true)}
        className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Or paste resume text
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}
