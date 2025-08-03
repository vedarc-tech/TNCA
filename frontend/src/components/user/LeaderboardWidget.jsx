import React from "react";
import { useNavigate } from "react-router-dom";

const LeaderboardWidget = ({ leaderboard = [] }) => {
  const navigate = useNavigate();
  const handleViewLeaderboard = () => {
    navigate("/user/leaderboard");
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
      <ol className="list-decimal ml-4 text-sm text-gray-700 mb-2">
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.slice(0, 3).map((user, i) => (
            <li key={user.id || user._id || i} className={i === 2 ? "font-bold text-blue-600" : ""}>
              {user.name || `User ${i + 1}`} - {user.iq_score || 0}
            </li>
          ))
        ) : (
          <li>No leaderboard data.</li>
        )}
      </ol>
      <button
        className="mt-2 px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        onClick={handleViewLeaderboard}
      >
        View Full Leaderboard
      </button>
    </div>
  );
};

export default LeaderboardWidget; 