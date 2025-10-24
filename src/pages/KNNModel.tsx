import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

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
  const [trained, setTrained] = useState(false);
  const [knnInfo, setKnnInfo] = useState<{ samples: number; classes: number } | null>(null);

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

    const uniqueLabels = new Set(data.data.map((d) => d[labelKey]));
    setKnnInfo({
      samples: data.data.length,
      classes: uniqueLabels.size,
    });
    setTrained(true);
  };

  const handlePredict = () => {
    if (!trained) {
      alert("Please train the model first");
      return;
    }

    const parsedInput = parseFloat(inputValue);
    if (!featureKey || !labelKey || isNaN(parsedInput)) {
      alert("Please enter a valid numeric value");
      return;
    }

    const distances = data.data
      .map((d) => ({
        distance: Math.abs(parseFloat(d[featureKey]) - parsedInput),
        label: String(d[labelKey]),
      }))
      .filter((d) => !isNaN(d.distance));

    if (distances.length === 0) {
      data.onPredict("Unknown");
      return;
    }

    distances.sort((a, b) => a.distance - b.distance);
    const topK = distances.slice(0, Math.min(k, distances.length));

    const freq: Record<string, number> = {};
    topK.forEach((item) => {
      freq[item.label] = (freq[item.label] || 0) + 1;
    });

    const prediction =
      Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

    data.onPredict(prediction);
  };

  return (
    <NodeWrapper title="🔍 K-Nearest Neighbors" color="#DC2626">
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
          <label style={{ fontSize: "13px", fontWeight: "600" }}>K (neighbors):</label>
          <input
            type="number"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value) || 3)}
            min={1}
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
            backgroundColor: "#DC2626",
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

        {knnInfo && (
          <div
            style={{
              fontSize: "11px",
              backgroundColor: "#FEE2E2",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <div><strong>Samples:</strong> {knnInfo.samples}</div>
            <div><strong>Classes:</strong> {knnInfo.classes}</div>
            <div><strong>K:</strong> {k}</div>
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Enter value for X:</label>
          <input
            type="number"
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
          Predict Class
        </button>
      </div>
    </NodeWrapper>
  );
};
