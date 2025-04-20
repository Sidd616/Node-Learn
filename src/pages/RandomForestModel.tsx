// Simulates "voting" by picking the most frequent prediction

import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface RandomForestModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const RandomForestModel: React.FC<NodeProps<RandomForestModelData>> = ({
  data,
}) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [labelKey, setLabelKey] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    }
  }, [data.data]);

  const handlePredict = () => {
    if (!featureKey || !labelKey || !inputValue) return;

    const matches = data.data.filter((d) => d[featureKey] === inputValue);
    const freqMap: Record<string, number> = {};

    matches.forEach((d) => {
      const label = d[labelKey];
      freqMap[label] = (freqMap[label] || 0) + 1;
    });

    const prediction =
      Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
    data.onPredict(prediction);
  };

  return (
    <NodeWrapper title="🌲 Random Forest Model">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">Random Forest</h2>

        <div className="mb-3">
          <label className="block font-medium mb-1">Select Feature:</label>
          <select
            className="border p-2 rounded w-full"
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Select Label:</label>
          <select
            className="border p-2 rounded w-full"
            value={labelKey}
            onChange={(e) => setLabelKey(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Input Feature Value:</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <button
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
          onClick={handlePredict}
          disabled={!featureKey || !labelKey}
        >
          Predict Label
        </button>
      </div>
    </NodeWrapper>
  );
};
