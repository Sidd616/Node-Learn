import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";
import { KNNVisualization } from '../components/ModelVisualizations';

interface KNNModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const KNNModel: React.FC<NodeProps<KNNModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [labelKey, setLabelKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [k, setK] = useState(3);
  const [prediction, setPrediction] = useState("");

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    }
  }, [data.data]);

  const handlePredict = () => {
    const parsedInput = parseFloat(inputValue);
    if (!featureKey || !labelKey || isNaN(parsedInput)) {
      alert("Please fill in all fields with valid values");
      return;
    }

    if (k <= 0 || k > data.data.length) {
      alert(`K must be between 1 and ${data.data.length}`);
      return;
    }

    // Calculate distances and store original indices
    const distances = data.data
      .map((d, index) => ({
        distance: Math.abs(parseFloat(d[featureKey]) - parsedInput),
        label: d[labelKey],
        index: index
      }))
      .filter(d => !isNaN(d.distance));

    // Sort by distance
    distances.sort((a, b) => {
      if (a.distance === b.distance) {
        // If distances are equal, use index as tiebreaker
        return a.index - b.index;
      }
      return a.distance - b.distance;
    });

    // Get k nearest neighbors
    const topK = distances.slice(0, k);
    
    // Weight votes by distance
    const votes: { [key: string]: number } = {};
    topK.forEach(neighbor => {
      const weight = 1 / (neighbor.distance + Number.EPSILON);
      votes[neighbor.label] = (votes[neighbor.label] || 0) + weight;
    });

    // Find the label with maximum weighted votes
    const predictionResult = Object.entries(votes)
      .reduce((max, [label, weight]) => 
        weight > max.weight ? { label, weight } : max,
        { label: "Unknown", weight: -Infinity }
      ).label;

    setPrediction(predictionResult);
    data.onPredict(predictionResult);
  };

  return (
    <NodeWrapper title="📍 KNN Classifier">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">K-Nearest Neighbors</h2>

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

        <div className="mb-3">
          <label className="block font-medium mb-1">Enter value for X:</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">
            K (number of neighbors):
          </label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value))}
            min={1}
          />
        </div>

        <div className="mb-4 visualization-container">
          <KNNVisualization 
            data={data.data}
            featureKey={featureKey}
            labelKey={labelKey}
            k={k}
            prediction={prediction}
          />
        </div>

        <button
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
          onClick={handlePredict}
        >
          Predict Class
        </button>
      </div>
    </NodeWrapper>
  );
};
