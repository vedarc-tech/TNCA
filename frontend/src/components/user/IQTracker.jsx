import React from "react";

const IQTracker = ({ iqScore = 0 }) => {
  const percent = Math.min(100, Math.round((iqScore / 200) * 100));
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">IQ Score</h3>
      <p className="text-3xl font-bold mb-2">{iqScore}</p>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
      <p className="text-xs text-gray-400">Keep improving your IQ!</p>
    </div>
  );
};

export default IQTracker; 