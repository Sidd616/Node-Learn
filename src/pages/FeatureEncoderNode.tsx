import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface FeatureEncoderNodeData {
  data: any[];
  processedData?: any[];
  onDataProcessed?: (processedData: any[]) => void;
}

export const FeatureEncoderNode: React.FC<NodeProps<FeatureEncoderNodeData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [encodingMap, setEncodingMap] = useState<Record<string, Record<string, number>>>({});
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

  const handleEncode = () => {
    if (!Array.isArray(data.data) || data.data.length === 0) {
      setStatus("No data available");
      return;
    }

    if (selectedColumns.length === 0) {
      setStatus("No columns selected");
      return;
    }

    const newEncodingMap: Record<string, Record<string, number>> = {};
    const encoded = data.data.map((row) => {
      const newRow = { ...row };

      selectedColumns.forEach((col) => {
        const value = row[col];
        
        if (!newEncodingMap[col]) {
          newEncodingMap[col] = {};
        }

        if (newEncodingMap[col][value] === undefined) {
          newEncodingMap[col][value] = Object.keys(newEncodingMap[col]).length;
        }

        newRow[col] = newEncodingMap[col][value];
      });

      return newRow;
    });

    setProcessedData(encoded);
    setEncodingMap(newEncodingMap);
    setStatus(`Encoded ${selectedColumns.length} column(s)`);

    if (data.onDataProcessed) {
      data.onDataProcessed(encoded);
    }
  };

  return (
    <NodeWrapper title="🔢 Feature Encoder" color="#8B5CF6">
      <div style={{ padding: "10px", minWidth: "250px" }}>
        <p style={{ fontSize: "12px", marginBottom: "8px", color: "#666" }}>
          Converts categorical variables into numeric format.
        </p>

        {headers.length > 0 ? (
          <>
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
              onClick={handleEncode}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#8B5CF6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Apply Encoding
            </button>

            <div style={{ marginTop: "10px", fontSize: "12px", color: "#555" }}>
              <strong>Status:</strong> {status}
            </div>

            {Object.keys(encodingMap).length > 0 && (
              <div style={{ marginTop: "10px", fontSize: "11px", backgroundColor: "#f9f9f9", padding: "8px", borderRadius: "4px", maxHeight: "100px", overflowY: "auto" }}>
                <strong>Encoding Map:</strong>
                {Object.entries(encodingMap).map(([col, mapping]) => (
                  <div key={col} style={{ marginTop: "4px" }}>
                    <strong>{col}:</strong> {JSON.stringify(mapping)}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: "12px", color: "#999" }}>Connect data source</p>
        )}
      </div>
    </NodeWrapper>
  );
};
