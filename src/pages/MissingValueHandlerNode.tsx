import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface MissingValueHandlerNodeData {
  data: any[];
  processedData?: any[];
  onDataProcessed?: (processedData: any[]) => void;
}

export const MissingValueHandlerNode: React.FC<NodeProps<MissingValueHandlerNodeData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [strategy, setStrategy] = useState<string>("mean");
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

  const handleProcess = () => {
    if (!Array.isArray(data.data) || data.data.length === 0) {
      setStatus("No data available");
      return;
    }

    if (selectedColumns.length === 0) {
      setStatus("No columns selected");
      return;
    }

    let processed = [...data.data];
    let removedRows = 0;

    if (strategy === "remove") {
      // Remove rows with missing values in selected columns
      processed = processed.filter((row) => {
        return selectedColumns.every((col) => {
          const val = row[col];
          return val !== null && val !== undefined && val !== "" && val !== "NA" && val !== "NaN";
        });
      });
      removedRows = data.data.length - processed.length;
    } else {
      // Calculate mean/median for each selected column
      const replacementValues: Record<string, number> = {};

      selectedColumns.forEach((col) => {
        const values = data.data
          .map((row) => parseFloat(row[col]))
          .filter((v) => !isNaN(v));

        if (values.length > 0) {
          if (strategy === "mean") {
            replacementValues[col] = values.reduce((a, b) => a + b, 0) / values.length;
          } else if (strategy === "median") {
            values.sort((a, b) => a - b);
            const mid = Math.floor(values.length / 2);
            replacementValues[col] = values.length % 2 === 0
              ? (values[mid - 1] + values[mid]) / 2
              : values[mid];
          }
        }
      });

      // Replace missing values
      processed = processed.map((row) => {
        const newRow = { ...row };
        selectedColumns.forEach((col) => {
          const val = row[col];
          if (val === null || val === undefined || val === "" || val === "NA" || val === "NaN" || isNaN(parseFloat(val))) {
            newRow[col] = replacementValues[col] || 0;
          }
        });
        return newRow;
      });
    }

    setProcessedData(processed);
    setStatus(
      strategy === "remove"
        ? `Removed ${removedRows} rows with missing values`
        : `Filled missing values using ${strategy}`
    );

    // Pass processed data to connected nodes
    if (data.onDataProcessed) {
      data.onDataProcessed(processed);
    }
  };

  return (
    <NodeWrapper title="🔧 Missing Value Handler" color="#F59E0B">
      <div style={{ padding: "10px", minWidth: "250px" }}>
        <p style={{ fontSize: "12px", marginBottom: "8px", color: "#666" }}>
          Replaces missing values using mean/median or removal.
        </p>

        {headers.length > 0 ? (
          <>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600" }}>Strategy:</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "12px",
                }}
              >
                <option value="mean">Mean</option>
                <option value="median">Median</option>
                <option value="remove">Remove Rows</option>
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
              onClick={handleProcess}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#F59E0B",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Apply Processing
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
