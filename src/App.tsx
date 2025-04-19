import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { FileUploader } from './pages/FileUploader';
import { RegressionModel } from './pages/RegressionModel';
import { OutputCard } from './pages/OutputCard';

const nodeTypes = {
  fileUploader: FileUploader,
  regression: RegressionModel,
  output: OutputCard,
};

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);

  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'fileUploader',
      position: { x: 0, y: 0 },
      data: {
        onFileUpload: setCsvData,
      },
    },
    {
      id: '2',
      type: 'regression',
      position: { x: 350, y: 0 },
      data: {
        data: [],
        onPredict: setPrediction,
      },
    },
    {
      id: '3',
      type: 'output',
      position: { x: 700, y: 0 },
      data: {
        result: null,
      },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // 🔁 Update regression node when csvData changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === '2'
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

  // 🔁 Update output node when prediction changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === '3'
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

  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
