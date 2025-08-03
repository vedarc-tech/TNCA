import React from "react";

const ProfileSummary = ({ user }) => {
  if (!user) return null;
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      {user.profile_picture ? (
        <img src={user.profile_picture} alt="Avatar" className="w-20 h-20 rounded-full mb-2 object-cover" />
      ) : (
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-3xl font-bold text-gray-500">
          {user.name ? user.name[0] : "U"}
        </div>
      )}
      <h2 className="text-xl font-semibold mb-1">{user.name || "Student"}</h2>
      <p className="text-gray-500 text-sm mb-2">ID: {user.id || user._id || "-"}</p>
      <p className="text-xs text-gray-400">Profile info is admin-controlled and view-only.</p>
    </div>
  );
};

export default ProfileSummary; 