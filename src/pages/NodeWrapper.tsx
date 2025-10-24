import { Handle, Position } from "reactflow";

const NodeWrapper = ({
  title,
  children,
  color = "#3B82F6",
}: {
  title: string;
  children: React.ReactNode;
  color?: string;
}) => (
  <div
    style={{
      background: "#fff",
      border: `2px solid ${color}`,
      borderRadius: "12px",
      padding: "12px",
      minWidth: "200px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    }}
  >
    <Handle type="target" position={Position.Left} style={{ background: color }} />
    <div
      style={{
        fontSize: "14px",
        fontWeight: "700",
        marginBottom: "10px",
        color: color,
        borderBottom: `2px solid ${color}`,
        paddingBottom: "6px",
      }}
    >
      {title}
    </div>
    {children}
    <Handle type="source" position={Position.Right} style={{ background: color }} />
  </div>
);

export default NodeWrapper;
