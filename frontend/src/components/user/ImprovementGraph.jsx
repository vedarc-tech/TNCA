import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ImprovementGraph = ({ history = [] }) => {
  // Prepare data for Recharts
  const data = history && history.length > 0
    ? history.map((h, i) => ({
        iq: h.iq_score || 0,
        date: h.date ? new Date(h.date).toLocaleDateString() : `#${i + 1}`
      }))
    : [];
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center h-full">
      <h3 className="text-lg font-semibold mb-2">Improvement Graph</h3>
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 200]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="iq" stroke="#3B82F6" strokeWidth={3} dot={true} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <span>No data yet</span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">Visual progress from first login to now.</p>
    </div>
  );
};

export default ImprovementGraph; 