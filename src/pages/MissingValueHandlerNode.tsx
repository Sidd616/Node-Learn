import React from "react";

export const MissingValueHandlerNode = () => {
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-gray-800 shadow-sm">
      <h4 className="font-semibold mb-1 text-yellow-700">Missing Value Handler</h4>
      <p>Replaces missing values using mean/median or removal.</p>
    </div>
  );
};
