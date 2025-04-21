import React, { useState, useEffect } from "react";
import NodeWrapper from "./NodeWrapper";
import { NodeProps } from "reactflow";
import { DecisionTreeVisualization } from '../components/ModelVisualizations';

interface Node {
  feature?: string;
  threshold?: number;
  value?: string;
  left?: Node | null;
  right?: Node | null;
}

interface DecisionTreeModelData {
  data: any[];
  onPredict: (value: string) => void;
}

function calculateGini(labels: string[]): number {
  const counts: { [key: string]: number } = {};
  labels.forEach(label => {
    counts[label] = (counts[label] || 0) + 1;
  });
  
  const total = labels.length;
  return 1 - Object.values(counts).reduce((sum, count) => {
    const probability = count / total;
    return sum + probability * probability;
  }, 0);
}

function buildDecisionTree(data: any[], features: string[], labelKey: string, maxDepth: number = 5): Node {
  if (!data || data.length === 0 || maxDepth === 0) {
    return { value: "Unknown" };
  }

  const labels = data.map(d => d[labelKey]);
  
  const uniqueLabels = new Set(labels);
  if (uniqueLabels.size === 1) {
    return { value: labels[0] };
  }

  if (features.length === 0) {
    const labelCounts = new Map<string, number>();
    labels.forEach(label => {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    });
    const mostCommon = Array.from(labelCounts.entries())
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    return { value: mostCommon };
  }

  let bestGini = Infinity;
  let bestSplit: { feature: string; threshold: number } | null = null;
  let bestGroups: [any[], any[]] | null = null;

  for (const feature of features) {
    const values = data
      .map(d => parseFloat(d[feature]))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);
    
    const uniqueValues = [...new Set(values)];
    
    for (let i = 0; i < uniqueValues.length - 1; i++) {
      const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
      const leftGroup = data.filter(d => parseFloat(d[feature]) <= threshold);
      const rightGroup = data.filter(d => parseFloat(d[feature]) > threshold);
      
      if (leftGroup.length === 0 || rightGroup.length === 0) continue;

      const gini = (leftGroup.length / data.length) * calculateGini(leftGroup.map(d => d[labelKey])) +
                   (rightGroup.length / data.length) * calculateGini(rightGroup.map(d => d[labelKey]));
      
      if (gini < bestGini) {
        bestGini = gini;
        bestSplit = { feature, threshold };
        bestGroups = [leftGroup, rightGroup];
      }
    }
  }

  if (!bestSplit || !bestGroups) {
    const mostCommon = labels.sort((a, b) => 
      labels.filter(v => v === a).length - labels.filter(v => v === b).length
    ).pop();
    return { value: mostCommon || "Unknown" };
  }

  const remainingFeatures = features.filter(f => f !== bestSplit.feature);

  return {
    feature: bestSplit.feature,
    threshold: bestSplit.threshold,
    left: buildDecisionTree(bestGroups[0], remainingFeatures, labelKey, maxDepth - 1),
    right: buildDecisionTree(bestGroups[1], remainingFeatures, labelKey, maxDepth - 1)
  };
}

function predict(tree: Node, instance: any): string {
  if (!tree) return "Unknown";
  if (tree.value !== undefined) return tree.value;
  if (!tree.feature || tree.threshold === undefined) return "Unknown";
  
  const value = parseFloat(instance[tree.feature]);
  if (isNaN(value)) return "Unknown";
  
  return value <= tree.threshold
    ? predict(tree.left || { value: "Unknown" }, instance)
    : predict(tree.right || { value: "Unknown" }, instance);
}

export const DecisionTreeModel: React.FC<NodeProps<DecisionTreeModelData>> = ({
  data,
}) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [labelKey, setLabelKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [tree, setTree] = useState<Node | null>(null);

  useEffect(() => {
    if (data.data.length > 0) {
      setHeaders(Object.keys(data.data[0]));
    }
  }, [data.data]);

  const handlePredict = () => {
    if (!featureKey || !labelKey || !inputValue) return;

    const features = headers.filter(h => h !== labelKey);
    const builtTree = buildDecisionTree(data.data, features, labelKey);
    setTree(builtTree);
    const prediction = predict(builtTree, { [featureKey]: inputValue });
    data.onPredict(prediction);
  };

  return (
    <NodeWrapper title="🌳 Decision Tree Model">
      <div className="p-4 border rounded shadow bg-white">
        <h2 className="text-lg font-semibold mb-4">Decision Tree</h2>

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
          <label className="block font-medium mb-1">Select Label:</label>
          <select
            className="border p-2 rounded w-full"
            value={labelKey}
            onChange={(e) => setLabelKey(e.target.value)}
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
          <label className="block font-medium mb-1">Input Feature Value:</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <DecisionTreeVisualization tree={tree} />
        </div>

        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={handlePredict}
          disabled={!featureKey || !labelKey}
        >
          Predict Label
        </button>
      </div>
    </NodeWrapper>
  );
};
