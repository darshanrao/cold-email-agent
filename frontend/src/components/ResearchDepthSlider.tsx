"use client";

import { Sliders } from "lucide-react";

interface ResearchDepthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const depthLabels = ["Quick", "Light", "Normal", "Deep", "Max"];
const depthDescriptions = [
  "1-2 sources, basic search",
  "2-3 sources, homepage crawl",
  "3-4 sources, multiple pages",
  "4-5 sources, careers + blog",
  "5+ sources, full site crawl",
];

export default function ResearchDepthSlider({
  value,
  onChange,
}: ResearchDepthSliderProps) {
  return (
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
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Quick</span>
          <span className="font-medium text-indigo-600">{depthLabels[value]}</span>
          <span>Deep</span>
        </div>
        <p className="text-xs text-gray-400 text-center">
          {depthDescriptions[value]}
        </p>
      </div>
    </div>
  );
}
