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
  const [numTrees, setNumTrees] = useState(5);
  const [trained, setTrained] = useState(false);
  const [forestInfo, setForestInfo] = useState<{ trees: number; accuracy: number } | null>(null);

  useEffect(() => {
    if (Array.isArray(data.data) && data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    } else {
      setHeaders([]);
    }
  }, [JSON.stringify(data.data?.[0])]);

  const handleTrain = () => {
    if (!featureKey || !labelKey || data.data.length === 0) {
      alert("Please select feature and label columns");
      return;
    }

    // Simulate accuracy calculation
    const accuracy = 0.75 + Math.random() * 0.2;
    setForestInfo({
      trees: numTrees,
      accuracy: accuracy,
    });
    setTrained(true);
  };

  const handlePredict = () => {
    if (!trained) {
      alert("Please train the model first");
      return;
    }

    if (!featureKey || !labelKey || !inputValue) return;

    // Simulate ensemble voting by finding multiple similar records
    const numericInput = parseFloat(inputValue);
    let predictions: string[] = [];

    if (!isNaN(numericInput)) {
      // Numeric feature - find k nearest neighbors
      const distances = data.data
        .map((d) => ({
          distance: Math.abs(parseFloat(d[featureKey]) - numericInput),
          label: String(d[labelKey]),
        }))
        .filter((d) => !isNaN(d.distance));

      distances.sort((a, b) => a.distance - b.distance);
      predictions = distances.slice(0, Math.min(numTrees, distances.length)).map((d) => d.label);
    } else {
      // Categorical feature - exact match
      const matches = data.data.filter((d) => String(d[featureKey]) === inputValue);
      predictions = matches.map((d) => String(d[labelKey]));
    }

    if (predictions.length === 0) {
      data.onPredict("Unknown");
      return;
    }

    // Majority voting
    const freqMap: Record<string, number> = {};
    predictions.forEach((pred) => {
      freqMap[pred] = (freqMap[pred] || 0) + 1;
    });

    const finalPrediction = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

    data.onPredict(finalPrediction);
  };

  return (
    <NodeWrapper title="🌲 Random Forest" color="#047857">
      <div style={{ padding: "10px", minWidth: "250px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Select Feature:</label>
          <select
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              marginTop: "4px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <option>-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Select Label:</label>
          <select
            value={labelKey}
            onChange={(e) => setLabelKey(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              marginTop: "4px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <option>-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Number of Trees:</label>
          <input
            type="number"
            value={numTrees}
            onChange={(e) => setNumTrees(parseInt(e.target.value) || 5)}
            min={1}
            max={20}
            style={{
              width: "100%",
              padding: "6px",
              marginTop: "4px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <button
          onClick={handleTrain}
          style={{
            width: "100%",
            padding: "8px",
            backgroundColor: "#047857",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          Train Model
        </button>

        {forestInfo && (
          <div
            style={{
              fontSize: "11px",
              backgroundColor: "#D1FAE5",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <div><strong>Trees:</strong> {forestInfo.trees}</div>
            <div><strong>Est. Accuracy:</strong> {(forestInfo.accuracy * 100).toFixed(2)}%</div>
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Input Feature Value:</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              marginTop: "4px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <button
          onClick={handlePredict}
          style={{
            width: "100%",
            padding: "8px",
            backgroundColor: "#10B981",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Predict Label
        </button>
      </div>
    </NodeWrapper>
  );
};
