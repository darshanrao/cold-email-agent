import React, { useState } from 'react';
import { Upload, FileText, Link, Sliders, Mail, Copy, RefreshCw, Check, Sparkles, Building2, User, Lightbulb, HelpCircle } from 'lucide-react';

export default function ColdReachWireframe() {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [researchDepth, setResearchDepth] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailGenerated, setEmailGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleResumeUpload = () => {
    setResumeUploaded(true);
    setResumeName('darshan_resume.pdf');
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setEmailGenerated(true);
    }, 2000);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const depthLabels = ['Quick', 'Light', 'Normal', 'Deep', 'Max'];

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
        <p className="text-gray-500 ml-13">AI-powered personalized cold emails for founders & hiring managers</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column - Inputs */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Resume
            </h2>
            
            {!resumeUploaded ? (
              <div 
                onClick={handleResumeUpload}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">Upload PDF / DOCX / Paste Text</p>
                <p className="text-xs text-gray-400 mt-1">Drag & drop or click to browse</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{resumeName}</p>
                  <p className="text-xs text-green-600">Successfully uploaded</p>
                </div>
                <Check className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Job Description
            </h2>
            
            <div className="space-y-3">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Link className="w-4 h-4" />
                  Enter URL
                </button>
              </div>
            </div>
          </div>

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

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Research Depth
            </h2>
            
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="4"
                value={researchDepth}
                onChange={(e) => setResearchDepth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Quick</span>
                <span className="font-medium text-indigo-600">{depthLabels[researchDepth]}</span>
                <span>Deep</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            {isGenerating ? (
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
        </div>

        {/* Right Column - Outputs */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Research Insights
            </h2>
            
            {!emailGenerated ? (
              <div className="text-center py-12 text-gray-400">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Insights will appear here after generation</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-blue-800 uppercase mb-2 flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    Top Fit Reasons
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Experience with agent workflows</li>
                    <li>• Startup velocity + quick iteration</li>
                    <li>• Relevant skill match (LLMs, infra)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-purple-800 uppercase mb-2 flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    Company Insights
                  </h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• "AI-native bank" vision</li>
                    <li>• Recent Series A funding</li>
                    <li>• New Fraud API launched</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-amber-800 uppercase mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Unique Angle
                  </h3>
                  <p className="text-sm text-amber-700">
                    "You've built agentic systems similar to the company's core engine."
                  </p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-green-800 uppercase mb-2 flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" />
                    Curiosity Question
                  </h3>
                  <p className="text-sm text-green-700">
                    "How do you maintain schema consistency across your agent fleet?"
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Your Personalized Email
            </h2>
            
            {!emailGenerated ? (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Your email will appear here</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-700 leading-relaxed">
                  <p className="mb-3">Hi Alex,</p>
                  <p className="mb-3">
                    I came across Selfin's vision for an AI-native bank and was impressed by the recent Fraud API launch. Having built agentic systems at my previous role, I see strong parallels with your core infrastructure challenges.
                  </p>
                  <p className="mb-3">
                    I'm particularly curious: how do you maintain schema consistency across your agent fleet as you scale?
                  </p>
                  <p className="mb-3">
                    Given my experience with LLM infrastructure and rapid iteration in startup environments, I'd love to explore how I might contribute to Selfin's mission.
                  </p>
                  <p className="mb-3">Would you be open to a brief chat?</p>
                  <p>Best,<br />Darshan</p>
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
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
              </>
            )}
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
