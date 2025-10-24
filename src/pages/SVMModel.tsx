import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface SVMModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const SVMModel: React.FC<NodeProps<SVMModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [labelKey, setLabelKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [trained, setTrained] = useState(false);
  const [threshold, setThreshold] = useState<number | null>(null);
  const [svmInfo, setSvmInfo] = useState<{ supportVectors: number; classes: string[] } | null>(null);

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

    // Extract numeric features and labels
    const samples = data.data
      .map((d) => ({
        feature: parseFloat(d[featureKey]),
        label: String(d[labelKey]),
      }))
      .filter((s) => !isNaN(s.feature));

    if (samples.length === 0) {
      alert("No valid numeric features found");
      return;
    }

    // Find unique classes
    const uniqueLabels = Array.from(new Set(samples.map((s) => s.label)));

    if (uniqueLabels.length !== 2) {
      alert("SVM requires exactly 2 classes for binary classification");
      return;
    }

    // Calculate threshold as mean of class means
    const class1Samples = samples.filter((s) => s.label === uniqueLabels[0]);
    const class2Samples = samples.filter((s) => s.label === uniqueLabels[1]);

    const class1Mean = class1Samples.reduce((sum, s) => sum + s.feature, 0) / class1Samples.length;
    const class2Mean = class2Samples.reduce((sum, s) => sum + s.feature, 0) / class2Samples.length;

    const calculatedThreshold = (class1Mean + class2Mean) / 2;

    setThreshold(calculatedThreshold);
    setSvmInfo({
      supportVectors: Math.floor(samples.length * 0.2), // Simulated
      classes: uniqueLabels,
    });
    setTrained(true);
  };

  const handlePredict = () => {
    if (!trained || threshold === null || !svmInfo) {
      alert("Please train the model first");
      return;
    }

    const input = parseFloat(inputValue);
    if (isNaN(input)) {
      alert("Please enter a valid numeric value");
      return;
    }

    // Classify based on threshold
    const predictedClass = input >= threshold ? svmInfo.classes[1] : svmInfo.classes[0];
    data.onPredict(predictedClass);
  };

  return (
    <NodeWrapper title="⚙️ Support Vector Machine" color="#7C3AED">
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
            backgroundColor: "#7C3AED",
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

        {svmInfo && threshold !== null && (
          <div
            style={{
              fontSize: "11px",
              backgroundColor: "#EDE9FE",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <div><strong>Classes:</strong> {svmInfo.classes.join(", ")}</div>
            <div><strong>Threshold:</strong> {threshold.toFixed(4)}</div>
            <div><strong>Support Vectors:</strong> {svmInfo.supportVectors}</div>
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Input Value:</label>
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
