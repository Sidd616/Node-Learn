import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";

interface KMeansModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const KMeansModel: React.FC<NodeProps<KMeansModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<number[]>([]);
  const [trained, setTrained] = useState(false);
  const [clusterInfo, setClusterInfo] = useState<{ iterations: number; inertia: number } | null>(null);

  useEffect(() => {
    if (!Array.isArray(data.data) || data.data.length === 0) {
      setHeaders([]);
      return;
    }
    setHeaders(Object.keys(data.data[0]));
  }, [JSON.stringify(data.data?.[0])]);

  const runKMeans = (points: number[], k: number): { centroids: number[]; iterations: number; inertia: number } => {
    let centroids = points.slice(0, k);
    let assignments: number[] = [];
    let iterations = 0;
    const maxIterations = 100;

    for (let iter = 0; iter < maxIterations; iter++) {
      iterations++;
      const oldCentroids = [...centroids];

      // Assignment step
      assignments = points.map((p) =>
        centroids.reduce(
          (closestIdx, c, i) =>
            Math.abs(p - c) < Math.abs(p - centroids[closestIdx])
              ? i
              : closestIdx,
          0
        )
      );

      // Update step
      const newCentroids = Array(k).fill(0);
      const counts = Array(k).fill(0);

      points.forEach((p, idx) => {
        const cluster = assignments[idx];
        newCentroids[cluster] += p;
        counts[cluster] += 1;
      });

      centroids = newCentroids.map((sum, i) =>
        counts[i] ? sum / counts[i] : centroids[i]
      );

      // Check convergence
      const converged = centroids.every(
        (c, i) => Math.abs(c - oldCentroids[i]) < 0.0001
      );

      if (converged) break;
    }

    // Calculate inertia (sum of squared distances)
    const inertia = points.reduce((sum, p, idx) => {
      const cluster = assignments[idx];
      return sum + Math.pow(p - centroids[cluster], 2);
    }, 0);

    return { centroids, iterations, inertia };
  };

  const handleTrain = () => {
    if (!featureKey || data.data.length === 0) {
      alert("Please select a feature");
      return;
    }

    const points = data.data
      .map((d) => parseFloat(d[featureKey]))
      .filter((v) => !isNaN(v));

    if (points.length < k) {
      alert(`Not enough data points. Need at least ${k} points.`);
      return;
    }

    const result = runKMeans(points, k);
    setCentroids(result.centroids);
    setClusterInfo({
      iterations: result.iterations,
      inertia: result.inertia,
    });
    setTrained(true);
  };

  const handlePredict = () => {
    if (!trained || centroids.length === 0) {
      alert("Please train the model first");
      return;
    }

    const input = parseFloat(inputValue);
    if (isNaN(input)) {
      alert("Please enter a valid numeric value");
      return;
    }

    const nearest = centroids.reduce(
      (closestIdx, c, i) =>
        Math.abs(input - c) < Math.abs(input - centroids[closestIdx])
          ? i
          : closestIdx,
      0
    );

    data.onPredict(`Cluster ${nearest + 1} (centroid: ${centroids[nearest].toFixed(2)})`);
  };

  return (
    <NodeWrapper title="📊 K-Means Clustering" color="#EA580C">
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
          <label style={{ fontSize: "13px", fontWeight: "600" }}>K (clusters):</label>
          <input
            type="number"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value) || 3)}
            min={1}
            max={10}
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
            backgroundColor: "#EA580C",
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

        {clusterInfo && centroids.length > 0 && (
          <div
            style={{
              fontSize: "11px",
              backgroundColor: "#FFEDD5",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <div><strong>Iterations:</strong> {clusterInfo.iterations}</div>
            <div><strong>Inertia:</strong> {clusterInfo.inertia.toFixed(2)}</div>
            <div><strong>Centroids:</strong></div>
            {centroids.map((c, i) => (
              <div key={i} style={{ marginLeft: "8px" }}>
                Cluster {i + 1}: {c.toFixed(4)}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600" }}>Enter value to cluster:</label>
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
          Predict Cluster
        </button>
      </div>
    </NodeWrapper>
  );
};
