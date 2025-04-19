import React, { useState, useEffect } from 'react';
import NodeWrapper from './NodeWrapper';
import { NodeProps } from 'reactflow';

interface RegressionModelData {
  data: any[];
  onPredict: (value: number) => void;
}

export const RegressionModel: React.FC<NodeProps<RegressionModelData>> = ({ data }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [xKey, setXKey] = useState('');
  const [yKey, setYKey] = useState('');
  const [inputX, setInputX] = useState('');

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0])); // Update headers when data changes
    }
  }, [data.data]);

  const handlePredict = () => {
    const rawData = data.data;
    if (!xKey || !yKey || rawData.length === 0) return;

    const xVals = rawData.map((d) => parseFloat(d[xKey])).filter((val) => !isNaN(val));
    const yVals = rawData.map((d) => parseFloat(d[yKey])).filter((val) => !isNaN(val));

    if (xVals.length !== yVals.length || xVals.length === 0) {
      alert('Invalid or mismatched data');
      return;
    }

    const meanX = xVals.reduce((a, b) => a + b, 0) / xVals.length;
    const meanY = yVals.reduce((a, b) => a + b, 0) / yVals.length;

    const numerator = xVals.reduce((sum, x, i) => sum + (x - meanX) * (yVals[i] - meanY), 0);
    const denominator = xVals.reduce((sum, x) => sum + (x - meanX) ** 2, 0);

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    const xInput = parseFloat(inputX);
    if (isNaN(xInput)) return;

    const prediction = slope * xInput + intercept;
    data.onPredict(prediction); // Send the prediction result
  };

  return (
    <NodeWrapper title="📈 Regression Model">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">Regression Model</h2>

        <div className="mb-3">
          <label className="block font-medium mb-1">Select X Axis:</label>
          <select
            className="border p-2 rounded w-full"
            value={xKey}
            onChange={(e) => setXKey(e.target.value)}
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
          <label className="block font-medium mb-1">Select Y Axis:</label>
          <select
            className="border p-2 rounded w-full"
            value={yKey}
            onChange={(e) => setYKey(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Enter value for X:</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={inputX}
            onChange={(e) => setInputX(e.target.value)}
          />
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handlePredict}
          disabled={!xKey || !yKey}
        >
          Predict Y
        </button>
      </div>
    </NodeWrapper>
  );
};
