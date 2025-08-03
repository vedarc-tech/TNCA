import { useState, useEffect } from "react";
import { sessionManager } from "../utils/sessionManager";

const API_BASE = "/api";

const useUserDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = sessionManager.getAccessToken();
    if (!token) {
      setError("Not authenticated. Please log in.");
      setLoading(false);
      return;
    }
    const authHeader = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/user/dashboard`, { headers: authHeader }).then(r => r.json()),
      fetch(`${API_BASE}/user/performance`, { headers: authHeader }).then(r => r.json()),
      fetch(`${API_BASE}/user/stats`, { headers: authHeader }).then(r => r.json()),
      fetch(`${API_BASE}/user/leaderboard`, { headers: authHeader }).then(r => r.json()),
      fetch(`${API_BASE}/content?type=announcement`, { headers: authHeader }).then(r => r.json()),
    ])
      .then(([dashboardRes, perfRes, statsRes, leaderboardRes, announcementsRes]) => {
        if (!dashboardRes.success) throw new Error(dashboardRes.message);
        if (!perfRes.success) throw new Error(perfRes.message);
        if (!statsRes.success) throw new Error(statsRes.message);
        if (!leaderboardRes.success) throw new Error(leaderboardRes.message);
        if (!announcementsRes.success) throw new Error(announcementsRes.message);
        setDashboard(dashboardRes.data);
        setPerformance(perfRes.data);
        setStats(statsRes.data);
        setLeaderboard(leaderboardRes.data);
        setAnnouncements(announcementsRes.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { loading, error, dashboard, performance, stats, leaderboard, announcements };
};

export default useUserDashboardData; 