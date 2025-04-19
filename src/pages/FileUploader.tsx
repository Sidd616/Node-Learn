import React from 'react';
import NodeWrapper from './NodeWrapper';
import { Handle, Position } from 'reactflow';
import { NodeProps } from 'reactflow';

type FileUploaderProps = {
  onFileUpload: (data: any[]) => void;
};

export const FileUploader: React.FC<NodeProps<FileUploaderProps>> = ({ data }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map((row) => row.split(','));
      const headers = rows.shift();
      const jsonData = rows.map((row) =>
        Object.fromEntries(row.map((val, i) => [headers?.[i], val]))
      );
      data.onFileUpload(jsonData); // Update the parent state
    };
    reader.readAsText(file);
  };

  return (
    <NodeWrapper title="📁 CSV Uploader">
      <Handle type="source" position={Position.Right} />
      <input
        type="file"
        accept=".csv"
        className="w-full p-2 text-sm text-gray-300 bg-gray-700 rounded border border-gray-600"
        onChange={handleFileChange}
      />
    </NodeWrapper>
  );
};
