import React from "react";

const BADGES = [
  "Bronze",
  "Silver",
  "Gold",
  "Diamond",
  "Crown",
  "Ace",
  "Conqueror"
];
const BADGE_EMOJIS = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Diamond: "💎",
  Crown: "👑",
  Ace: "🂡",
  Conqueror: "🏆"
};

const PerformanceBadge = ({ badgeLevel = "Bronze" }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
    <h3 className="text-lg font-semibold mb-2">Performance Badge</h3>
    <div className="text-4xl mb-2">{BADGE_EMOJIS[badgeLevel] || "🥉"}</div>
    <p className="font-semibold mb-1">{badgeLevel}</p>
    <div className="flex gap-1 text-xs text-gray-500 flex-wrap justify-center">
      {BADGES.map((badge, i) => (
        <span
          key={badge}
          className={
            badge === badgeLevel
              ? "font-bold text-yellow-600 underline"
              : ""
          }
        >
          {badge}
          {i < BADGES.length - 1 && <span> → </span>}
        </span>
      ))}
    </div>
  </div>
);

export default PerformanceBadge; 