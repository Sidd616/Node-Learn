import React, { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Card } from "@heroui/card";

const nodeOptions = [
  { id: "fileUploader", label: "File Uploader" },
  { id: "regression", label: "Regression Model" },
  { id: "decisionTree", label: "Decision Tree" },
  { id: "randomForest", label: "Random Forest" },
  { id: "svm", label: "SVM" },
  { id: "knn", label: "KNN" },
  { id: "kmeans", label: "K-Means" },
  { id: "normalization", label: "Normalization" },
  { id: "missingHandler", label: "Missing Value Handler" },
  { id: "featureEncoder", label: "Feature Encoder" },
  { id: "outputt", label: "Output" },
];

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-md"
      >
        {open ? <X /> : <Menu />}
      </button>

      {/* Collapsible Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: open ? 0 : -250 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 z-40 shadow-xl overflow-y-auto"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Node Library</h2>
        <div className="flex flex-col gap-3">
          {nodeOptions.map((node) => (
            <Card
              key={node.id}
              draggable
              onDragStart={(e:any) => handleDragStart(e, node.id)}
              className="cursor-grab bg-gray-800 text-white hover:bg-gray-700 transition-all p-3 rounded-xl shadow-sm"
            >
              {node.label}
            </Card>
          ))}
        </div>
      </motion.div>
    </>
  );
};
