import { Handle, Position } from "reactflow";

const NodeWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="relative bg-white rounded shadow border p-2 w-[250px] ">
    <Handle
      type="target"
      position={Position.Left}
      className="w-2 h-2 bg-blue-500"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="w-2 h-2 bg-green-500"
    />
    <div className="font-bold text-sm mb-2">{title}</div>
    {children}
  </div>
);

export default NodeWrapper;
