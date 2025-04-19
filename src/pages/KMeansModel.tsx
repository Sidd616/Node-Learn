import React, { useState, useEffect } from 'react';
import NodeWrapper from './NodeWrapper';
import { NodeProps } from 'reactflow';

interface KMeansModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const KMeansModel: React.FC<NodeProps<KMeansModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<number[]>([]);

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    }
  }, [data.data]);

  const runKMeans = (points: number[], k: number): number[] => {
    let centroids = points.slice(0, k); // initial centroids
    let assignments: number[] = [];

    for (let iter = 0; iter < 10; iter++) {
      assignments = points.map((p) =>
        centroids.reduce((closestIdx, c, i) =>
          Math.abs(p - c) < Math.abs(p - centroids[closestIdx]) ? i : closestIdx, 0)
      );

      const newCentroids = Array(k).fill(0);
      const counts = Array(k).fill(0);

      points.forEach((p, idx) => {
        const cluster = assignments[idx];
        newCentroids[cluster] += p;
        counts[cluster] += 1;
      });

      centroids = newCentroids.map((sum, i) => (counts[i] ? sum / counts[i] : centroids[i]));
    }

    return centroids;
  };

  const handlePredict = () => {
    if (!featureKey || !inputValue || isNaN(parseFloat(inputValue))) return;

    const points = data.data.map((d) => parseFloat(d[featureKey])).filter((v) => !isNaN(v));
    const centroids = runKMeans(points, k);
    const input = parseFloat(inputValue);

    const nearest = centroids.reduce((closestIdx, c, i) =>
      Math.abs(input - c) < Math.abs(input - centroids[closestIdx]) ? i : closestIdx, 0);

    setCentroids(centroids);
    data.onPredict(`Cluster ${nearest + 1}`);
  };

  return (
    <NodeWrapper title="📊 K-Means Clustering">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">K-Means Clustering</h2>

        <div className="mb-3">
          <label className="block font-medium mb-1">Select Feature:</label>
          <select className="border p-2 rounded w-full" value={featureKey} onChange={(e) => setFeatureKey(e.target.value)}>
            <option value="">-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Enter value to cluster:</label>
          <input type="number" className="border p-2 rounded w-full" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">K (number of clusters):</label>
          <input type="number" className="border p-2 rounded w-full" value={k} onChange={(e) => setK(parseInt(e.target.value))} min={1} />
        </div>

        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded" onClick={handlePredict}>
          Predict Cluster
        </button>
      </div>
    </NodeWrapper>
  );
};
