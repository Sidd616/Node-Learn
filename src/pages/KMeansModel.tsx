import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";
import { KMeansVisualization } from '../components/ModelVisualizations';

interface KMeansModelData {
  data: any[];
  onPredict: (value: string) => void;
}

function initializeCentroids(data: number[], k: number): number[] {
  const centroids: number[] = [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  
  for (let i = 0; i < k; i++) {
    centroids.push(min + (max - min) * Math.random());
  }
  return centroids;
}

function findNearestCentroid(point: number, centroids: number[]): number {
  let minDistance = Infinity;
  let nearestIndex = 0;
  
  centroids.forEach((centroid, index) => {
    const distance = Math.abs(point - centroid);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });
  
  return nearestIndex;
}

function updateCentroids(data: number[], assignments: number[], k: number): number[] {
  const newCentroids = new Array(k).fill(0);
  const counts = new Array(k).fill(0);
  
  data.forEach((point, i) => {
    const cluster = assignments[i];
    newCentroids[cluster] += point;
    counts[cluster]++;
  });
  
  return newCentroids.map((sum, i) => 
    counts[i] > 0 ? sum / counts[i] : sum
  );
}

function kMeans(data: number[], k: number, maxIterations: number = 100): number[] {
  if (!data.length || k <= 0 || k > data.length) {
    throw new Error("Invalid input parameters");
  }

  let centroids = initializeCentroids(data, k);
  let oldCentroids: number[] = [];
  let iterations = 0;
  
  while (iterations < maxIterations) {
    // Assign points to clusters
    const assignments = data.map(point => 
      findNearestCentroid(point, centroids)
    );
    
    // Update centroids
    oldCentroids = [...centroids];
    centroids = updateCentroids(data, assignments, k);
    
    // Check convergence
    const hasConverged = centroids.every((centroid, i) => 
      Math.abs(centroid - oldCentroids[i]) < 0.0001
    );
    
    if (hasConverged) break;
    iterations++;
  }
  
  return centroids;
}

export const KMeansModel: React.FC<NodeProps<KMeansModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<number[]>([]);
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    }
  }, [data.data]);

  const handlePredict = () => {
    if (!featureKey || !inputValue || isNaN(parseFloat(inputValue))) {
      alert("Please fill in all fields with valid values");
      return;
    }

    if (k <= 0 || k > data.data.length) {
      alert(`K must be between 1 and ${data.data.length}`);
      return;
    }

    try {
      const points = data.data
        .map((d) => parseFloat(d[featureKey]))
        .filter((v) => !isNaN(v));
      
      if (points.length === 0) {
        alert("No valid numerical data found");
        return;
      }

      const centroids = kMeans(points, k);
      const input = parseFloat(inputValue);

      const nearest = centroids.reduce(
        (closestIdx, c, i) =>
          Math.abs(input - c) < Math.abs(input - centroids[closestIdx])
            ? i
            : closestIdx,
        0
      );

      setCentroids(centroids);
      setPoints(points);
      data.onPredict(`Cluster ${nearest + 1}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <NodeWrapper title="📊 K-Means Clustering">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">K-Means Clustering</h2>

        <div className="mb-3">
          <label className="block font-medium mb-1">Select Feature:</label>
          <select
            className="border p-2 rounded w-full"
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">
            Enter value to cluster:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">
            K (number of clusters):
          </label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value))}
            min={1}
          />
        </div>

        <div className="mb-4 visualization-container">
          <KMeansVisualization 
            data={points} 
            centroids={centroids} 
          />
        </div>

        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          onClick={handlePredict}
        >
          Predict Cluster
        </button>
      </div>
    </NodeWrapper>
  );
};
