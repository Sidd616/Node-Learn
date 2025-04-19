import React, { useState, useEffect } from 'react';
import NodeWrapper from './NodeWrapper';
import { NodeProps } from 'reactflow';

interface KNNModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const KNNModel: React.FC<NodeProps<KNNModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState('');
  const [labelKey, setLabelKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [k, setK] = useState(3);

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    }
  }, [data.data]);

  const handlePredict = () => {
    const parsedInput = parseFloat(inputValue);
    if (!featureKey || !labelKey || isNaN(parsedInput)) return;

    const distances = data.data
      .map((d) => ({
        distance: Math.abs(parseFloat(d[featureKey]) - parsedInput),
        label: d[labelKey],
      }))
      .filter((d) => !isNaN(d.distance));

    distances.sort((a, b) => a.distance - b.distance);

    const topK = distances.slice(0, k);
    const freq: Record<string, number> = {};

    topK.forEach((item) => {
      freq[item.label] = (freq[item.label] || 0) + 1;
    });

    const prediction = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    data.onPredict(prediction);
  };

  return (
    <NodeWrapper title="📍 KNN Classifier">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">K-Nearest Neighbors</h2>

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
          <label className="block font-medium mb-1">Select Label:</label>
          <select className="border p-2 rounded w-full" value={labelKey} onChange={(e) => setLabelKey(e.target.value)}>
            <option value="">-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Enter value for X:</label>
          <input type="number" className="border p-2 rounded w-full" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">K (number of neighbors):</label>
          <input type="number" className="border p-2 rounded w-full" value={k} onChange={(e) => setK(parseInt(e.target.value))} min={1} />
        </div>

        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded" onClick={handlePredict}>
          Predict Class
        </button>
      </div>
    </NodeWrapper>
  );
};
