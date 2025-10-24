import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface DecisionTreeModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const DecisionTreeModel: React.FC<NodeProps<DecisionTreeModelData>> = ({
  data,
}) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [labelKey, setLabelKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [trained, setTrained] = useState(false);
  const [treeInfo, setTreeInfo] = useState<{ uniqueClasses: number; samples: number } | null>(null);

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
    setTreeInfo({
      uniqueClasses: uniqueLabels.size,
      samples: data.data.length,
    });
    setTrained(true);
  };

  const handlePredict = () => {
    if (!trained) {
      alert("Please train the model first");
      return;
    }

    if (!featureKey || !labelKey || !inputValue) return;

    // Find exact match
    const match = data.data.find((d) => String(d[featureKey]) === String(inputValue));

    if (match) {
      data.onPredict(String(match[labelKey]));
    } else {
      // Find nearest match (for numeric features)
      const numericInput = parseFloat(inputValue);
      if (!isNaN(numericInput)) {
        const distances = data.data
          .map((d, idx) => ({
            distance: Math.abs(parseFloat(d[featureKey]) - numericInput),
            label: d[labelKey],
            index: idx,
          }))
          .filter((d) => !isNaN(d.distance));

        if (distances.length > 0) {
          distances.sort((a, b) => a.distance - b.distance);
          data.onPredict(String(distances[0].label));
        } else {
          data.onPredict("Unknown");
        }
      } else {
        data.onPredict("Unknown");
      }
    }
  };

  return (
    <NodeWrapper title="🌳 Decision Tree" color="#059669">
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

        <button
          onClick={handleTrain}
          style={{
            width: "100%",
            padding: "8px",
            backgroundColor: "#059669",
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

        {treeInfo && (
          <div
            style={{
              fontSize: "11px",
              backgroundColor: "#D1FAE5",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <div><strong>Classes:</strong> {treeInfo.uniqueClasses}</div>
            <div><strong>Samples:</strong> {treeInfo.samples}</div>
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
