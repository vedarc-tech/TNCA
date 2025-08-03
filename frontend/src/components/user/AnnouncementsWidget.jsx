import React from "react";
import { useNavigate } from "react-router-dom";

const AnnouncementsWidget = ({ announcements = [] }) => {
  const navigate = useNavigate();
  const handleViewAll = () => {
    navigate("/user/announcements");
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Announcements</h3>
      <ul className="text-sm text-gray-700 mb-2">
        {announcements && announcements.length > 0 ? (
          announcements.map((a, i) => (
            <li key={a.id || a._id || i} className="mb-1">
              <span className="font-semibold">{a.title || "Announcement"}</span>: {a.summary || a.content || ""}
            </li>
          ))
        ) : (
          <li>No announcements.</li>
        )}
      </ul>
      <button
        className="mt-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        onClick={handleViewAll}
      >
        View All
      </button>
    </div>
  );
};

export default AnnouncementsWidget; 