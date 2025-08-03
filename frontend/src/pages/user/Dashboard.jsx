import React from "react";
import { motion } from "framer-motion";
import useUserDashboardData from "../../hooks/useUserDashboardData";
import ProfileSummary from "../../components/user/ProfileSummary";
import QuizzesWidget from "../../components/user/QuizzesWidget";
import GamesWidget from "../../components/user/GamesWidget";
import IQTracker from "../../components/user/IQTracker";
import ImprovementGraph from "../../components/user/ImprovementGraph";
import PerformanceBadge from "../../components/user/PerformanceBadge";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.08 * i, type: "spring", stiffness: 80, damping: 18 }
  })
};

const UserDashboard = () => {
  const { loading, error, dashboard, performance } = useUserDashboardData();

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  // Card content
  const cardProps = {
    className: "glass-card dashboard-card flex flex-col justify-center items-center min-h-[320px] w-full max-w-md mx-auto p-6 rounded-3xl"
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-10 pb-16">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight font-[Orbitron,Exo,Inter,sans-serif]">Your Dashboard</h1>
      <p className="text-lg text-gray-400 mb-10 text-center font-medium">Welcome! Track your progress, play, and level up your skills.</p>
      {/* First row: Profile, IQ, Badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <motion.div {...cardProps} custom={0} initial="hidden" animate="visible" variants={cardVariants}><ProfileSummary user={dashboard.user} /></motion.div>
        <motion.div {...cardProps} custom={1} initial="hidden" animate="visible" variants={cardVariants}><IQTracker iqScore={performance.iq_score} /></motion.div>
        <motion.div {...cardProps} custom={2} initial="hidden" animate="visible" variants={cardVariants}><PerformanceBadge badgeLevel={performance.badge_level} /></motion.div>
      </div>
      {/* Second row: Quizzes, Games, Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <motion.div {...cardProps} custom={3} initial="hidden" animate="visible" variants={cardVariants}><QuizzesWidget quizzes={dashboard.recent_quiz_attempts} availableQuizzes={dashboard.available_quizzes} /></motion.div>
        <motion.div {...cardProps} custom={4} initial="hidden" animate="visible" variants={cardVariants}><GamesWidget games={dashboard.recent_game_scores} /></motion.div>
        <motion.div {...cardProps} custom={5} initial="hidden" animate="visible" variants={cardVariants}><ImprovementGraph history={performance.performance_history} /></motion.div>
      </div>
    </div>
  );
};

export default UserDashboard; 