import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface NormalizationNodeData {
  data: any[];
  processedData?: any[];
  onDataProcessed?: (processedData: any[]) => void;
}

export const NormalizationNode: React.FC<NodeProps<NormalizationNodeData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [normalizationType, setNormalizationType] = useState<string>("minmax");
  const [status, setStatus] = useState<string>("Not processed");

  useEffect(() => {
    if (Array.isArray(data.data) && data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    } else {
      setHeaders([]);
    }
  }, [JSON.stringify(data.data?.[0])]);

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleNormalize = () => {
    if (!Array.isArray(data.data) || data.data.length === 0) {
      setStatus("No data available");
      return;
    }

    if (selectedColumns.length === 0) {
      setStatus("No columns selected");
      return;
    }

    const normalized = data.data.map((row) => ({ ...row }));

    selectedColumns.forEach((col) => {
      const values = data.data
        .map((row) => parseFloat(row[col]))
        .filter((v) => !isNaN(v));

      if (values.length === 0) return;

      if (normalizationType === "minmax") {
        // Min-Max Normalization (0-1)
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        normalized.forEach((row, idx) => {
          const val = parseFloat(data.data[idx][col]);
          if (!isNaN(val) && range !== 0) {
            row[col] = ((val - min) / range).toFixed(4);
          }
        });
      } else if (normalizationType === "zscore") {
        // Z-score Normalization (standardization)
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        normalized.forEach((row, idx) => {
          const val = parseFloat(data.data[idx][col]);
          if (!isNaN(val) && stdDev !== 0) {
            row[col] = ((val - mean) / stdDev).toFixed(4);
          }
        });
      }
    });

    setProcessedData(normalized);
    setStatus(`Normalized ${selectedColumns.length} column(s) using ${normalizationType}`);

    // Pass processed data to connected nodes
    if (data.onDataProcessed) {
      data.onDataProcessed(normalized);
    }
  };

  return (
    <NodeWrapper title="📏 Normalization" color="#10B981">
      <div style={{ padding: "10px", minWidth: "250px" }}>
        <p style={{ fontSize: "12px", marginBottom: "8px", color: "#666" }}>
          Scales features to a consistent range.
        </p>

        {headers.length > 0 ? (
          <>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600" }}>Normalization Type:</label>
              <select
                value={normalizationType}
                onChange={(e) => setNormalizationType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "12px",
                }}
              >
                <option value="minmax">Min-Max (0-1)</option>
                <option value="zscore">Z-Score (Standardization)</option>
              </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600" }}>Select Columns:</label>
              <div style={{ maxHeight: "120px", overflowY: "auto", border: "1px solid #ddd", padding: "5px", borderRadius: "4px" }}>
                {headers.map((header) => (
                  <div key={header} style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(header)}
                      onChange={() => handleColumnToggle(header)}
                      style={{ marginRight: "6px" }}
                    />
                    <span style={{ fontSize: "12px" }}>{header}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleNormalize}
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
              Apply Normalization
            </button>

            <div style={{ marginTop: "10px", fontSize: "12px", color: "#555" }}>
              <strong>Status:</strong> {status}
            </div>
          </>
        ) : (
          <p style={{ fontSize: "12px", color: "#999" }}>Connect data source</p>
        )}
      </div>
    </NodeWrapper>
  );
};
