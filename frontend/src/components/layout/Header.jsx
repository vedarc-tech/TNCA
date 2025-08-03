import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaSignOutAlt, 
  FaCog,
  FaTrophy,
  FaCube
} from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import tncaLogo from '../../assets/tncalogo1.jpg'
import cubeskoolLogo from '../../assets/cubeskoollogo1.png'

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const location = useLocation()

  // Define static pages where dynamic navbar should be shown
  const staticPages = ['/', '/about', '/contact', '/login', '/register']
  const isStaticPage = staticPages.includes(location.pathname)

  // Scroll detection - only for static pages
  useEffect(() => {
    if (!isStaticPage) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Check if scrolled down
      if (currentScrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
      
      // Check scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsScrollingDown(true)
      } else if (currentScrollY < lastScrollY) {
        setIsScrollingDown(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isStaticPage])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FaUser },
    { name: 'Quizzes', href: '/quizzes', icon: FaCube },
    { name: 'Games', href: '/games', icon: FaCube },
    { name: 'Play Games', href: '/play-games', icon: FaCube },
    { name: 'Tournaments', href: '/tournaments', icon: FaTrophy },
    { name: 'Matches', href: '/matches', icon: FaTrophy },
    { name: 'Leaderboard', href: '/leaderboard', icon: FaTrophy },
    { name: 'Profile', href: '/profile', icon: FaCog },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: FaUser },
    { name: 'Users', href: '/admin/users', icon: FaUser },
    { name: 'Quizzes', href: '/admin/quizzes', icon: FaCube },
    { name: 'Games', href: '/admin/games', icon: FaCube },
    { name: 'Play Games', href: '/admin/play-games', icon: FaCube },
    { name: 'Tournaments', href: '/admin/tournaments', icon: FaTrophy },
    { name: 'Analytics', href: '/admin/analytics', icon: FaTrophy },
  ]

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
  }

  const getBadgeColor = (badgeLevel) => {
    const colors = {
      'Novice Cubist': 'bg-gray-500',
      'Bronze Cubist': 'bg-badge-bronze',
      'Silver Cubist': 'bg-badge-silver',
      'Gold Cubist': 'bg-badge-gold',
      'Platinum Cubist': 'bg-badge-platinum',
      'Diamond Cubist': 'bg-badge-diamond',
    }
    return colors[badgeLevel] || 'bg-gray-500'
  }

  // Flying animation variants - only for static pages
  const flyingAnimation = {
    initial: { 
      x: 0, 
      y: 0, 
      scale: 1,
      rotateY: 0,
      filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))'
    },
    scrolled: { 
      x: '50%', 
      y: -5, 
      scale: 1.1,
      rotateY: 5,
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        y: {
          duration: 0.8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }
      }
    },
    exit: { 
      x: 0, 
      y: 0, 
      scale: 1,
      rotateY: 0,
      filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))',
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  const logoContainerAnimation = {
    initial: { 
      justifyContent: 'flex-start',
      width: 'auto'
    },
    scrolled: { 
      justifyContent: 'center',
      width: '100%',
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      justifyContent: 'flex-start',
      width: 'auto',
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  // Dashboard Header (Simple, no flying animations)
  if (!isStaticPage) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Simple Logo for Dashboard */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <img 
                  src={tncaLogo} 
                  alt="TNCA Logo" 
                  className="w-auto h-auto max-h-10"
                  style={{ objectFit: 'contain' }}
                />
                <span className="text-xl font-bold text-gray-900 font-display">
                  &
                </span>
                <img 
                  src={cubeskoolLogo} 
                  alt="Cubeskool Logo" 
                  className="w-auto h-auto max-h-10"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span className="text-lg font-bold text-gray-900 font-display hidden sm:block">
                Iqualizer
              </span>
            </Link>

            {/* User Menu for Dashboard */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="hidden sm:block">{user?.name}</span>
                    {user?.badge_level && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getBadgeColor(user.badge_level)}`}>
                        {user.badge_level}
                      </span>
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                    >
                      {isAdmin ? (
                        adminNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.name}
                          </Link>
                        ))
                      ) : (
                        userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.name}
                          </Link>
                        ))
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <FaTimes className="w-6 h-6" />
                ) : (
                  <FaBars className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation for Dashboard */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-2">
                {isAuthenticated && (
                  <>
                    {isAdmin ? (
                      adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      ))
                    ) : (
                      userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      ))
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>
    )
  }

  // Static Pages Header (with flying animations)
  return (
    <motion.header 
      className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}
      initial={{ y: 0 }}
      animate={{ 
        y: isScrollingDown && isScrolled ? -100 : 0,
        height: isScrolled ? '4rem' : '4rem'
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Flying Animation */}
          <motion.div
            className="flex items-center"
            variants={logoContainerAnimation}
            initial="initial"
            animate={isScrolled ? "scrolled" : "exit"}
          >
            <motion.div
              className="flex items-center space-x-3"
              variants={flyingAnimation}
              initial="initial"
              animate={isScrolled ? "scrolled" : "exit"}
              style={{
                transform: isScrolled ? 'translateX(-50%)' : 'translateX(0%)'
              }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <motion.img 
                    src={tncaLogo} 
                    alt="TNCA Logo" 
                    className="w-auto h-auto max-h-12"
                    style={{ objectFit: 'contain' }}
                    animate={{
                      rotateY: isScrolled ? [0, 5, -5, 0] : 0,
                      scale: isScrolled ? 1.05 : 1
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                      rotateY: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  />
                  <motion.span 
                    className="text-2xl font-bold text-gray-900 font-display"
                    animate={{
                      scale: isScrolled ? 1.1 : 1,
                      y: isScrolled ? [-2, 2, -2] : 0
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                      y: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    &
                  </motion.span>
                  <motion.img 
                    src={cubeskoolLogo} 
                    alt="Cubeskool Logo" 
                    className="w-auto h-auto max-h-12"
                    style={{ objectFit: 'contain' }}
                    animate={{
                      rotateY: isScrolled ? [0, -5, 5, 0] : 0,
                      scale: isScrolled ? 1.05 : 1
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                      rotateY: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  />
                </div>
                <AnimatePresence>
                  {!isScrolled && (
                    <motion.span 
                      className="text-xl font-bold text-gray-900 font-display hidden sm:block"
                      initial={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -20 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                      Iqualizer
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          </motion.div>

          {/* Desktop Navigation */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.nav 
                className="hidden md:flex space-x-8"
                initial={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      location.pathname === item.href
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>

          {/* User Menu / Login Button */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="hidden sm:block">{user?.name}</span>
                      {user?.badge_level && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getBadgeColor(user.badge_level)}`}>
                          {user.badge_level}
                        </span>
                      )}
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                      >
                        {isAdmin ? (
                          adminNavigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <item.icon className="w-4 h-4 mr-3" />
                              {item.name}
                            </Link>
                          ))
                        ) : (
                          userNavigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <item.icon className="w-4 h-4 mr-3" />
                              {item.name}
                            </Link>
                          ))
                        )}
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaSignOutAlt className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="btn-primary"
                  >
                    Login
                  </Link>
                )}

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {isMenuOpen ? (
                    <FaTimes className="w-6 h-6" />
                  ) : (
                    <FaBars className="w-6 h-6" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  {isAdmin ? (
                    adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.name}
                      </Link>
                    ))
                  ) : (
                    userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.name}
                      </Link>
                    ))
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

export default Header 