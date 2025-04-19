// Dummy binary classifier using threshold (for visualization)

import React, { useState, useEffect } from 'react';
import NodeWrapper from './NodeWrapper';
import { NodeProps } from 'reactflow';

interface SVMModelData {
  data: any[];
  onPredict: (value: string) => void;
}

export const SVMModel: React.FC<NodeProps<SVMModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState('');
  const [threshold, setThreshold] = useState('');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    }
  }, [data.data]);

  const handlePredict = () => {
    const input = parseFloat(inputValue);
    const th = parseFloat(threshold);
    if (isNaN(input) || isNaN(th)) return;

    const result = input >= th ? 'Class A' : 'Class B';
    data.onPredict(result);
  };

  return (
    <NodeWrapper title="🧍 SVM Classifier">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">Support Vector Machine</h2>

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
          <label className="block font-medium mb-1">Threshold:</label>
          <input type="number" className="border p-2 rounded w-full" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Input Value:</label>
          <input type="number" className="border p-2 rounded w-full" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </div>

        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded" onClick={handlePredict}>
          Predict Class
        </button>
      </div>
    </NodeWrapper>
  );
};
