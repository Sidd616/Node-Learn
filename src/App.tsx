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

const availableNodes = [
  { id: "fileUploader", label: "📁 File Uploader" },
  { id: "regression", label: "📈 Regression Model" },
  { id: "decisionTree", label: "🌳 Decision Tree" },
  { id: "randomForest", label: "🌲 Random Forest" },
  { id: "svm", label: "⚙️ SVM" },
  { id: "knn", label: "🔍 KNN" },
  { id: "kmeans", label: "📊 K-Means" },
  { id: "outputt", label: "🧾 Output" },
];

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
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

  useEffect(() => {
    const connectedNodeIds = edges
      .filter((edge) => edge.source === "1")
      .map((edge) => edge.target);

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
        const isConnectedToFileUploader = connectedNodeIds.includes(node.id);

        if (isModelNode && isConnectedToFileUploader) {
          const existingPredictHandler = node.data.onPredict;
          return {
            ...node,
            data: {
              ...node.data,
              data: csvData,
              onPredict: existingPredictHandler,
            },
          };
        }
        return node;
      })
    );
  }, [csvData, edges, setNodes]);

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

  // ============= SIDEBAR (from Navbar styling) ======================
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-screen h-screen relative">
      <ReactFlowProvider>
        {/* ===== SIDEBAR ===== */}
        <button
          onClick={() => setOpen(!open)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-md"
        >
          {open ? <X /> : <Menu />}
        </button>

        <motion.div
          initial={{ x: -250 }}
          animate={{ x: open ? 0 : -250 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 z-40 shadow-xl overflow-y-auto"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">Node Library</h2>
          <div className="flex flex-col gap-3">
            {availableNodes.map((node) => (
              <Card
                key={node.id}
                draggable
                onDragStart={(e: any) => handleDragStart(e, node.id)}
                className="cursor-grab bg-gray-800 text-white hover:bg-gray-700 transition-all p-3 rounded-xl shadow-sm"
              >
                {node.label}
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ===== MAIN REACT FLOW CANVAS ===== */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeContextMenu={handleNodeContextMenu}
          fitView
        >
          <Background />
          <Controls />

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
