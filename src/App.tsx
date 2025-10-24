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
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Card } from "@heroui/card";
import { FileUploader } from "./pages/FileUploader";
import { RegressionModel } from "./pages/RegressionModel";
import { DecisionTreeModel } from "./pages/DecisionTreeModel";
import { RandomForestModel } from "./pages/RandomForestModel";
import { SVMModel } from "./pages/SVMModel";
import { KNNModel } from "./pages/KNNModel";
import { KMeansModel } from "./pages/KMeansModel";
import { OutputCard } from "./pages/OutputCard";
import { FeatureEncoderNode } from "./pages/FeatureEncoderNode";
import { MissingValueHandlerNode } from "./pages/MissingValueHandlerNode";
import { NormalizationNode } from "./pages/NormalizationNode";

const nodeTypes = {
  fileUploader: FileUploader,
  regression: RegressionModel,
  decisionTree: DecisionTreeModel,
  randomForest: RandomForestModel,
  svm: SVMModel,
  knn: KNNModel,
  kmeans: KMeansModel,
  outputt: OutputCard,
  featureEncoder: FeatureEncoderNode,
  missingValueHandler: MissingValueHandlerNode,
  normalization: NormalizationNode,
};

// Organized node library with sections
const nodeCategories = [
  {
    category: "📂 Data Input",
    nodes: [{ id: "fileUploader", label: "📁 File Uploader" }],
  },
  {
    category: "🔧 Preprocessing",
    nodes: [
      { id: "missingValueHandler", label: "🔧 Missing Values" },
      { id: "normalization", label: "📏 Normalization" },
      { id: "featureEncoder", label: "🔢 Feature Encoder" },
    ],
  },
  {
    category: "🤖 Models",
    nodes: [
      { id: "regression", label: "📈 Regression" },
      { id: "decisionTree", label: "🌳 Decision Tree" },
      { id: "randomForest", label: "🌲 Random Forest" },
      { id: "svm", label: "⚙️ SVM" },
      { id: "knn", label: "🔍 KNN" },
      { id: "kmeans", label: "📊 K-Means" },
    ],
  },
  {
    category: "📊 Output",
    nodes: [{ id: "outputt", label: "🧾 Output" }],
  },
];

const App: React.FC = () => {
  const [csvData, setCsvData] = useState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([
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
  ]);
  const [nextNodeId, setNextNodeId] = useState(9);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // ============= FILE DATA PROPAGATION ======================
  const onConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const getConnectedPairs = (edges: Edge[]) => {
    const modelOutputPairs: { modelId: string; outputId: string }[] = [];
    const outputNodes = edges.filter(
      (e) =>
        e.target.startsWith("3") ||
        (e.target.length > 0 &&
          nodes.find((n) => n.id === e.target)?.type === "outputt")
    );

    outputNodes.forEach((outputEdge) => {
      const modelId = outputEdge.source;
      const outputId = outputEdge.target;
      if (modelId && outputId) {
        modelOutputPairs.push({ modelId, outputId });
      }
    });

    return modelOutputPairs;
  };

  useEffect(() => {
    const connectedPairs = getConnectedPairs(edges);
    setNodes((nds) =>
      nds.map((node) => {
        const isModelNode = [
          "regression",
          "decisionTree",
          "randomForest",
          "svm",
          "knn",
          "kmeans",
        ].includes(node.type ?? "");

        const connectedOutputs = connectedPairs
          .filter((pair) => pair.modelId === node.id)
          .map((pair) => pair.outputId);

        if (isModelNode) {
          return {
            ...node,
            data: {
              ...node.data,
              onPredict: (value: number | string) => {
                setNodes((currentNodes) =>
                  currentNodes.map((n) => {
                    if (connectedOutputs.includes(n.id)) {
                      return {
                        ...n,
                        data: { ...n.data, result: value },
                      };
                    }
                    return n;
                  })
                );
              },
            },
          };
        }
        return node;
      })
    );
  }, [edges, setNodes]);

  // ============= PREPROCESSING NODE DATA PROPAGATION (FIXED) ======================
  useEffect(() => {
    // Get data for a specific node - this is the KEY FIX
    const getDataForNode = (nodeId: string): any[] => {
      const incomingEdges = edges.filter((e) => e.target === nodeId);

      for (const edge of incomingEdges) {
        const sourceNode = nodes.find((n) => n.id === edge.source);

        if (!sourceNode) continue;

        // If source is file uploader, return CSV data
        if (sourceNode.type === "fileUploader") {
          return csvData;
        }

        // If source is a preprocessing node
        if (["featureEncoder", "missingValueHandler", "normalization"].includes(sourceNode.type ?? "")) {
          // Return processed data if available, otherwise return raw incoming data
          if (sourceNode.data.processedData && sourceNode.data.processedData.length > 0) {
            return sourceNode.data.processedData;
          } else if (sourceNode.data.data && sourceNode.data.data.length > 0) {
            return sourceNode.data.data;
          }
        }
      }

      return [];
    };

    setNodes((nds) =>
      nds.map((node) => {
        const isPreprocessingNode = ["featureEncoder", "missingValueHandler", "normalization"].includes(node.type ?? "");
        const isModelNode = ["regression", "decisionTree", "randomForest", "svm", "knn", "kmeans"].includes(node.type ?? "");

        if (isPreprocessingNode || isModelNode) {
          const incomingData = getDataForNode(node.id);

          // Always update if there's incoming data
          if (incomingData.length > 0) {
            const existingPredictHandler = node.data.onPredict;
            const existingProcessHandler = node.data.onDataProcessed;

            return {
              ...node,
              data: {
                ...node.data,
                data: incomingData,
                onPredict: existingPredictHandler,
                onDataProcessed: existingProcessHandler || ((processedData: any[]) => {
                  // Store processed data in this node
                  setNodes((currentNodes) =>
                    currentNodes.map((n) =>
                      n.id === node.id
                        ? { ...n, data: { ...n.data, processedData } }
                        : n
                    )
                  );
                }),
              },
            };
          }
        }

        return node;
      })
    );
  }, [csvData, edges, nodes, setNodes]);

  // Reset disconnected output nodes
  useEffect(() => {
    const connectedPairs = getConnectedPairs(edges);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === "outputt") {
          const isConnected = connectedPairs.some(
            (pair) => pair.outputId === node.id
          );
          if (!isConnected) {
            return {
              ...node,
              data: { ...node.data, result: null },
            };
          }
        }
        return node;
      })
    );
  }, [edges, setNodes]);

  // ============= DELETE EDGE ======================
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  // ============= CONTEXT MENU ======================
  const [contextMenu, setContextMenu] = useState({
    x: 0,
    y: 0,
    visible: false,
  });
  const [contextNodeId, setContextNodeId] = useState<string | null>(null);

  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextNodeId(node.id);
    setContextMenu({ x: event.clientX, y: event.clientY, visible: true });
  };

  const deleteNode = () => {
    if (contextNodeId) {
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== contextNodeId && e.target !== contextNodeId
        )
      );
      setNodes((nds) => nds.filter((n) => n.id !== contextNodeId));
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  // ============= DRAG & DROP NODE CREATION ======================
  const [open, setOpen] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = rfInstance?.project({
        x: event.clientX - 250,
        y: event.clientY - 40,
      });

      let data: any = {};
      if (type === "fileUploader") {
        data = { onFileUpload: setCsvData };
      } else if (type === "outputt") {
        data = { result: null };
      } else if (["featureEncoder", "missingValueHandler", "normalization"].includes(type)) {
        data = { 
          data: [], 
          processedData: [],
          onDataProcessed: () => {} 
        };
      } else {
        data = { data: [], onPredict: () => {} };
      }

      const newNode: Node = {
        id: nextNodeId.toString(),
        type,
        position: position || { x: 100, y: 100 },
        data,
        style: {
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNextNodeId((id) => id + 1);
    },
    [rfInstance, nextNodeId, setNodes]
  );

  // ============= SIDEBAR ======================
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        {/* ===== SIDEBAR ===== */}
        <motion.div
          initial={{ x: open ? 0 : -300 }}
          animate={{ x: open ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "280px",
            height: "100vh",
            backgroundColor: "#1F2937",
            color: "#fff",
            zIndex: 40,
            overflowY: "auto",
            padding: "20px",
            boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
            🧩 Node Library
          </h2>

          {nodeCategories.map((category) => (
            <div key={category.category} style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "10px",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {category.category}
              </h3>
              {category.nodes.map((node) => (
                <div
                  key={node.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, node.id)}
                  style={{
                    cursor: "grab",
                    backgroundColor: "#374151",
                    color: "#fff",
                    padding: "12px",
                    marginBottom: "8px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#4B5563";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#374151";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {node.label}
                </div>
              ))}
            </div>
          ))}
        </motion.div>

        {/* ===== TOGGLE BUTTON ===== */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            position: "fixed",
            top: "20px",
            left: open ? "300px" : "20px",
            zIndex: 50,
            padding: "10px",
            backgroundColor: "#1F2937",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "left 0.3s",
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* ===== MAIN REACT FLOW CANVAS ===== */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          onNodeContextMenu={handleNodeContextMenu}
          onEdgeClick={onEdgeClick}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>

        {/* ===== CONTEXT MENU ===== */}
        {contextMenu.visible && (
          <div
            style={{
              position: "absolute",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              cursor: "pointer",
            }}
            onClick={deleteNode}
          >
            🗑 Delete Node
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default App;
