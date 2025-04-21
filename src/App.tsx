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
import './styles/visualizations.css';

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
  const [contextNodeId, setContextNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const initialNodes: Node[] = [
    {
      id: "1",
      type: "fileUploader",
      position: { x: -150, y: 300 },
      data: { onFileUpload: setCsvData },
    },
    {
      id: "3",
      type: "outputt",
      position: { x: 700, y: 300 },
      data: { result: null },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  // Update the getConnectedPairs function to handle all output nodes
  const getConnectedPairs = (edges: Edge[]) => {
    const modelOutputPairs: { modelId: string; outputId: string }[] = [];
    const outputNodes = edges.filter(e =>
      e.target.startsWith("3") ||
      (e.target.length > 0 && nodes.find(n => n.id === e.target)?.type === "outputt")
    );

    outputNodes.forEach(outputEdge => {
      const modelId = outputEdge.source;
      const outputId = outputEdge.target;
      if (modelId && outputId) {
        modelOutputPairs.push({ modelId, outputId });
      }
    });

    return modelOutputPairs;
  };

  // Update the prediction handling effect
  useEffect(() => {
    const connectedPairs = getConnectedPairs(edges);

    setNodes((nds) =>
      nds.map((node) => {
        const isModelNode = ["regression", "decisionTree", "randomForest", "svm", "knn", "kmeans"].includes(node.type ?? "");
        const connectedOutputs = connectedPairs
          .filter(pair => pair.modelId === node.id)
          .map(pair => pair.outputId);

        if (isModelNode) {
          return {
            ...node,
            data: {
              ...node.data,
              onPredict: (value: number | string) => {
                // Update all connected output nodes
                setNodes(currentNodes =>
                  currentNodes.map(n => {
                    if (connectedOutputs.includes(n.id)) {
                      return {
                        ...n,
                        data: { ...n.data, result: value }
                      };
                    }
                    return n;
                  })
                );
              }
            }
          };
        }

        return node;
      })
    );
  }, [edges, setNodes]);

  useEffect(() => {
    const connectedNodeIds = edges
      .filter((edge) => edge.source === "1")
      .map((edge) => edge.target);

    setNodes((nds) =>
      nds.map((node) => {
        const isModelNode = ["regression", "decisionTree", "randomForest", "svm", "knn", "kmeans"].includes(node.type ?? "");
        const isConnectedToFileUploader = connectedNodeIds.includes(node.id);

        if (isModelNode && isConnectedToFileUploader) {
          // Preserve existing connections and handlers
          const existingPredictHandler = node.data.onPredict;
          return {
            ...node,
            data: {
              ...node.data,
              data: csvData,
              onPredict: existingPredictHandler
            }
          };
        }
        return node;
      })
    );
  }, [csvData, edges, setNodes]);

  useEffect(() => {
    const connectedPairs = getConnectedPairs(edges);

    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === "outputt") {
          const isConnected = connectedPairs.some(pair => pair.outputId === node.id);
          if (!isConnected) {
            return {
              ...node,
              data: {
                ...node.data,
                result: null
              }
            };
          }
        }
        return node;
      })
    );
  }, [edges, setNodes]);

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const [nextNodeId, setNextNodeId] = useState(9);
  const [selectedNodeType, setSelectedNodeType] = useState("regression");

  const availableNodeTypes = [
    { label: "File Uploader", value: "fileUploader" },
    { label: "Regression", value: "regression" },
    { label: "Decision Tree", value: "decisionTree" },
    { label: "Random Forest", value: "randomForest" },
    { label: "SVM", value: "svm" },
    { label: "KNN", value: "knn" },
    { label: "KMeans", value: "kmeans" },
    { label: "Output", value: "outputt" },
  ];

  const handleAddCard = () => {
    const id = nextNodeId.toString();
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 600 + 100,
    };

    let data: any = {};

    if (selectedNodeType === "fileUploader") {
      data = { onFileUpload: setCsvData };
    } else if (selectedNodeType === "outputt") {
      data = {
        result: null  // Always start with null for new output cards
      };
    } else {
      // For model nodes
      data = {
        data: [], // Initialize with empty data
        onPredict: () => {}, // Initialize with empty handler
      };
    }

    const newNode: Node = {
      id,
      type: selectedNodeType,
      position,
      data,
      style: {
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB"
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNextNodeId((id) => id + 1);
  };

  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextNodeId(node.id);
    setContextMenu({ x: event.clientX, y: event.clientY, visible: true });
  };

  const deleteNode = () => {
    if (contextNodeId) {
      const connectedPairs = getConnectedPairs(edges);
      const affectedOutputs = connectedPairs
        .filter(pair => pair.modelId === contextNodeId)
        .map(pair => pair.outputId);

      // Remove all connected edges
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== contextNodeId && e.target !== contextNodeId
        )
      );

      // Remove the node
      setNodes((nds) =>
        nds.filter((n) => n.id !== contextNodeId)
      );

      // Reset only affected output nodes
      setNodes((nds) =>
        nds.map((n) => {
          if (affectedOutputs.includes(n.id)) {
            return {
              ...n,
              data: {
                ...n.data,
                result: null
              }
            };
          }
          return n;
        })
      );
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleClickOutside = () => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  return (
    <div className="w-screen h-screen relative">
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
          onNodeContextMenu={handleNodeContextMenu}
        >
          <Background />
          <Controls />
          <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-white p-3 rounded-2xl shadow-lg">
            <select
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              {availableNodeTypes.map((node) => (
                <option key={node.value} value={node.value}>
                  {node.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddCard}
              className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
            >
              + Add Card
            </button>
          </div>

          {contextMenu.visible && (
            <div
              className="absolute z-50 bg-white shadow-md border rounded p-2 text-sm cursor-pointer"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={deleteNode}
            >
              🗑 Delete Node
            </div>
          )}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default App;
