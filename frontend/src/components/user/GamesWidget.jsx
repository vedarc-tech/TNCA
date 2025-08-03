import React from "react";
import { useNavigate } from "react-router-dom";

const GamesWidget = ({ games = [] }) => {
  const navigate = useNavigate();
  const handlePlayGame = () => {
    navigate("/user/games");
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Games Played</h3>
      <p className="text-2xl font-bold mb-1">{games.length}</p>
      <ul className="text-sm text-gray-600 mb-2">
        {games.length === 0 && <li>No games played yet.</li>}
        {games.map((g, i) => (
          <li key={g._id || i}>
            {g.game_name || g.name || `Game ${i + 1}`}: {g.score != null ? g.score : "N/A"}
          </li>
        ))}
      </ul>
      <button
        className={`mt-2 px-4 py-1 rounded text-white ${games.length > 0 ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        onClick={handlePlayGame}
        disabled={games.length === 0}
      >
        Play a Game
      </button>
    </div>
  );
};

export default GamesWidget; 