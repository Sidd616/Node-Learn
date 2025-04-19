const NodeWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-gray-800 text-black rounded shadow-lg border border-gray-700 w-fit mx-auto my-4">
    <div className="bg-blue-600 px-4 py-2 rounded-t font-semibold">{title}</div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

export default NodeWrapper;
