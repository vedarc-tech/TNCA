import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CubeAnimationBg from "../user/CubeAnimationBg";
import { FaTachometerAlt, FaQuestionCircle, FaGamepad, FaTrophy, FaChartLine, FaUser, FaBullhorn, FaSignOutAlt } from "react-icons/fa";
import tncaLogo from "../../assets/tncalogo1.jpg";
import cubeskoolLogo from "../../assets/cubeskoollogo1.png";

const menuItems = [
  { name: "Dashboard", path: "/user/dashboard", icon: <FaTachometerAlt /> },
  { name: "Quizzes", path: "/user/quizzes", icon: <FaQuestionCircle /> },
  { name: "Games", path: "/user/games", icon: <FaGamepad /> },
  { name: "Leaderboard", path: "/user/leaderboard", icon: <FaTrophy /> },
  { name: "Performance", path: "/user/performance", icon: <FaChartLine /> },
  { name: "Profile", path: "/user/profile", icon: <FaUser /> },
  { name: "Announcements", path: "/user/announcements", icon: <FaBullhorn /> },
];

const LogoRow = () => (
  <div className="flex items-center justify-center gap-2">
    <a href="https://tamilnaducubeassociation.org/" target="_blank" rel="noopener noreferrer">
      <img src={tncaLogo} alt="TNCA Logo" className="h-10 w-auto rounded shadow-md" style={{ objectFit: 'contain' }} />
    </a>
    <span className="text-2xl font-bold text-gray-100">&</span>
    <a href="https://cubeskool.com/" target="_blank" rel="noopener noreferrer">
      <img src={cubeskoolLogo} alt="Cubeskool Logo" className="h-10 w-auto rounded shadow-md" style={{ objectFit: 'contain' }} />
    </a>
    <span className="text-xl font-extrabold tracking-tight text-white ml-2">Iqualizer</span>
  </div>
);

const LogoRowTop = () => (
  <div className="flex items-center gap-2">
    <a href="https://tamilnaducubeassociation.org/" target="_blank" rel="noopener noreferrer">
      <img src={tncaLogo} alt="TNCA Logo" className="h-8 w-auto rounded shadow-md" style={{ objectFit: 'contain' }} />
    </a>
    <span className="text-xl font-bold text-gray-700">&</span>
    <a href="https://cubeskool.com/" target="_blank" rel="noopener noreferrer">
      <img src={cubeskoolLogo} alt="Cubeskool Logo" className="h-8 w-auto rounded shadow-md" style={{ objectFit: 'contain' }} />
    </a>
    <span className="text-lg font-extrabold tracking-tight text-blue-700 ml-2">Iqualizer</span>
  </div>
);

const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 font-sans relative overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-700 to-purple-700 shadow-2xl z-20 text-white rounded-r-3xl relative overflow-visible">
        <div className="flex items-center justify-center h-24 border-b border-blue-700">
          <LogoRow />
        </div>
        <nav className="flex-1 py-8 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-8 py-3 rounded-l-full transition-all font-medium text-lg hover:bg-white/10 hover:pl-10 relative ${isActive ? "bg-white/20 text-yellow-300 font-bold shadow-lg sidebar-active-glow" : "text-white/90"}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="m-8 px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <FaSignOutAlt className="text-lg" /> Logout
        </button>
        {/* Soft right edge gradient fade */}
        <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-white/40 pointer-events-none rounded-r-3xl" style={{boxShadow: '12px 0 48px 0 rgba(80,80,180,0.14)'}}></div>
      </aside>
      {/* Divider */}
      <div className="hidden md:block w-2 h-full bg-gradient-to-b from-blue-200/40 to-purple-200/40 rounded-r-3xl blur-sm opacity-70"></div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative ml-4 md:ml-6">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-16 px-4 md:px-10 bg-white/80 shadow-lg backdrop-blur z-10">
          <LogoRowTop />
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700 text-lg">{user?.name}</span>
            {user?.badge_level && (
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded text-xs font-bold text-yellow-800 shadow">{user.badge_level}</span>
            )}
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow">
              {user?.name ? user.name[0] : "U"}
            </div>
          </div>
        </header>
        {/* Animated Cube Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-full h-full flex items-center justify-center opacity-20 blur-sm">
            <div className="w-[400px] h-[400px]">
              <CubeAnimationBg />
            </div>
          </div>
        </div>
        {/* Main Content */}
        <main className="flex-1 z-10 relative">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default UserLayout; 