import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

interface Point {
  x: number;
  y: number;
  label?: string;
  cluster?: number;
}

export const RegressionVisualization: React.FC<{
  data: any[];
  xKey: string;
  yKey: string;
  prediction?: number;
}> = ({ data, xKey, yKey, prediction }) => {
  const chartData = data.map(d => ({
    x: parseFloat(d[xKey]),
    y: parseFloat(d[yKey])
  })).filter(d => !isNaN(d.x) && !isNaN(d.y));

  return (
    <ScatterChart width={300} height={200} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid />
      <XAxis dataKey="x" name={xKey} />
      <YAxis dataKey="y" name={yKey} />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      <Scatter data={chartData} fill="#8884d8" />
      {prediction && (
        <Line
          type="monotone"
          dataKey="y"
          stroke="#ff7300"
          data={[
            { x: Math.min(...chartData.map(d => d.x)), y: prediction },
            { x: Math.max(...chartData.map(d => d.x)), y: prediction }
          ]}
        />
      )}
    </ScatterChart>
  );
};

export const DecisionTreeVisualization: React.FC<{
  tree: any;
}> = ({ tree }) => {
  if (!tree) return null;

  return (
    <div className="tree-container" style={{ width: '100%', height: '300px', overflow: 'auto' }}>
      <svg width="100%" height="100%">
        {renderTreeNode(tree, 150, 30, 100)}
      </svg>
    </div>
  );
};

export const KMeansVisualization: React.FC<{
  data: number[];
  centroids: number[];
}> = ({ data, centroids }) => {
  if (!data || !centroids) return null;

  const chartData = data.map(value => ({ x: value, y: 0 }));
  const centroidData = centroids.map(value => ({ x: value, y: 0 }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Value" />
        <YAxis type="number" dataKey="y" hide />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          content={({ payload }) => {
            if (!payload || !payload[0]) return null;
            return (
              <div className="recharts-tooltip-wrapper">
                <p>Value: {payload[0].payload.x}</p>
              </div>
            );
          }}
        />
        <Scatter data={chartData} fill="#8884d8" />
        <Scatter data={centroidData} fill="#ff0000" shape="star" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export const KNNVisualization: React.FC<{
  data: any[];
  featureKey: string;
  labelKey: string;
  k: number;
  prediction?: string;
}> = ({ data, featureKey, labelKey, k, prediction }) => {
  if (!data || !featureKey || !labelKey) return null;

  const chartData: Point[] = data
    .map(d => ({
      x: parseFloat(d[featureKey]),
      y: 0, // Using 0 for 1D visualization
      label: d[labelKey]
    }))
    .filter(d => !isNaN(d.x));

  const uniqueLabels = Array.from(new Set(chartData.map(d => d.label)));
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name={featureKey} />
        <YAxis type="number" dataKey="y" name="Value" hide />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          content={({ payload }) => {
            if (!payload || !payload[0]) return null;
            const data = payload[0].payload;
            return (
              <div className="recharts-tooltip-wrapper">
                <p>{`${featureKey}: ${data.x}`}</p>
                <p>{`${labelKey}: ${data.label}`}</p>
              </div>
            );
          }}
        />
        <Scatter data={chartData}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[uniqueLabels.indexOf(entry.label) % colors.length]}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

// Helper function for decision tree visualization
function renderTreeNode(node: any, x: number, y: number, offset: number): JSX.Element[] {
  if (!node) return [];

  const elements: JSX.Element[] = [];
  const radius = 20;
  const text = node.value || `${node.feature} <= ${node.threshold?.toFixed(2)}`;

  // Add node circle
  elements.push(
    <circle
      key={`circle-${x}-${y}`}
      cx={x}
      cy={y}
      r={radius}
      fill="white"
      stroke="#8884d8"
      strokeWidth={2}
    />
  );

  // Add node text
  elements.push(
    <text
      key={`text-${x}-${y}`}
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
    >
      {text}
    </text>
  );

  // Recursively render children
  if (node.left) {
    elements.push(
      <line
        key={`line-left-${x}-${y}`}
        x1={x}
        y1={y + radius}
        x2={x - offset}
        y2={y + 60}
        stroke="#8884d8"
        strokeWidth={1}
      />
    );
    elements.push(...renderTreeNode(node.left, x - offset, y + 60, offset / 2));
  }

  if (node.right) {
    elements.push(
      <line
        key={`line-right-${x}-${y}`}
        x1={x}
        y1={y + radius}
        x2={x + offset}
        y2={y + 60}
        stroke="#8884d8"
        strokeWidth={1}
      />
    );
    elements.push(...renderTreeNode(node.right, x + offset, y + 60, offset / 2));
  }

  return elements;
}