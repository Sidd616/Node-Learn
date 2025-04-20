import React, { useState } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

const ModelCard: React.FC<NodeProps> = ({ id, data }) => {
  const [modelType, setModelType] = useState<"regression" | "classification">(
    "regression"
  );
  const [inputValue, setInputValue] = useState("");

  const handlePredict = () => {    let prediction;
    if (modelType === "regression") {
      prediction = parseFloat(inputValue) * 2; // Dummy logic
    } else {
      prediction = parseFloat(inputValue) > 0.5 ? "Class A" : "Class B";
    }

    if (data.onPrediction) data.onPrediction(id, prediction); // send id & prediction
  };

  return (
    <NodeWrapper title="Model">
      <select
        value={modelType}
        onChange={(e) =>
          setModelType(e.target.value as "regression" | "classification")
        }
        className="mb-2"
      >
        <option value="regression">Regression</option>
        <option value="classification">Classification</option>
      </select>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="mb-2"
      />
      <button onClick={handlePredict}>Predict</button>
    </NodeWrapper>
  );
};
