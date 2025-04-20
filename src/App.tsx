import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
} from "reactflow";

import "reactflow/dist/style.css";

import { FileUploader } from "./pages/FileUploader";
import { RegressionModel } from "./pages/RegressionModel";
import { DecisionTreeModel } from "./pages/DecisionTreeModel";
import { RandomForestModel } from "./pages/RandomForestModel";
import { SVMModel } from "./pages/SVMModel";
import { KNNModel } from "./pages/KNNModel";
import { KMeansModel } from "./pages/KMeansModel";
import { OutputCard } from "./pages/OutputCard";

const nodeTypes = {
  fileUploader: FileUploader,
  regression: RegressionModel,
  decisionTree: DecisionTreeModel,
  randomForest: RandomForestModel,
  svm: SVMModel,
  knn: KNNModel,
  kmeans: KMeansModel,
  outputt: OutputCard,
};

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<number | string | null>(null);

  const initialNodes: Node[] = [
    {
      id: "1",
      type: "fileUploader",
      position: { x: -150, y: 300 },
      data: {
        onFileUpload: setCsvData,
      },
    },
    {
      id: "2",
      type: "regression",
      position: { x: 300, y: 100 },
      data: { data: [], onPredict: () => {} },
    },
    {
      id: "4",
      type: "decisionTree",
      position: { x: 300, y: 250 },
      data: { data: [], onPredict: () => {} },
    },
    {
      id: "5",
      type: "randomForest",
      position: { x: 300, y: 400 },
      data: { data: [], onPredict: () => {} },
    },
    {
      id: "6",
      type: "svm",
      position: { x: 300, y: 550 },
      data: { data: [], onPredict: () => {} },
    },
    {
      id: "7",
      type: "knn",
      position: { x: 300, y: 700 },
      data: { data: [], onPredict: () => {} },
    },
    {
      id: "8",
      type: "kmeans",
      position: { x: 300, y: 850 },
      data: { data: [], onPredict: () => {} },
    },
    {
      id: "3",
      type: "outputt",
      position: { x: 700, y: 300 },
      data: {
        result: null,
      },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // 🔁 Update all models with the uploaded CSV
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        [
          "regression",
          "decisionTree",
          "randomForest",
          "svm",
          "knn",
          "kmeans",
        ].includes(node.type ?? "")
          ? {
              ...node,
              data: {
                ...node.data,
                data: csvData,
              },
            }
          : node
      )
    );
  }, [csvData, setNodes]);

  // 🔁 Detect model node that connects fileUploader -> model -> output
  useEffect(() => {
    const fileUploaderEdge = edges.find((e) => e.source === "1");
    const outputEdge = edges.find((e) => e.target === "3");

    if (!fileUploaderEdge || !outputEdge) return;

    const modelNodeId = fileUploaderEdge.target;

    if (modelNodeId && outputEdge.source === modelNodeId) {
      const onPredict = (value: number | string) => {
        setPrediction(value);
      };

      // Inject onPredict ONLY into the connected model node
      setNodes((nds) =>
        nds.map((node) =>
          node.id === modelNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  onPredict,
                },
              }
            : {
                ...node,
                data: {
                  ...node.data,
                  onPredict: () => {}, // Disable others
                },
              }
        )
      );
    }
  }, [edges, setNodes]);

  // 🔁 Update OutputCard with prediction result
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === "3"
          ? {
              ...node,
              data: {
                ...node.data,
                result: prediction,
              },
            }
          : node
      )
    );
  }, [prediction, setNodes]);

  useEffect(() => {
    const outputEdge = edges.find((e) => e.target === "3");
    const activeId = outputEdge?.source;

    setNodes((nds) =>
      nds.map((node) => {
        const isActive = node.id === activeId;
        return {
          ...node,
          style: {
            ...node.style,
            backgroundColor: isActive ? "#DCFCE7" : "#FFFFFF", // green if active
            border: isActive ? "2px solid #22C55E" : "1px solid #E5E7EB",
          },
        };
      })
    );
  }, [edges]);

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation(); // Prevent triggering other click events
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default App;
