// OutputCard.tsx
import React from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface OutputCardData {
  result: number | null;
}

export const OutputCard: React.FC<NodeProps<OutputCardData>> = ({ data }) => {
  return (
    <NodeWrapper title="🔍 Prediction Output">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-2">Prediction Output</h2>

        {data.result !== null ? (       
          <p className="text-xl font-bold text-green-600">
            Result: {data.result}
          </p>
        ) : (
          <p className="text-gray-500">No prediction yet.</p>
        )}
      </div>
    </NodeWrapper>
  );
};
