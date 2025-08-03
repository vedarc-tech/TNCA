import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaBrain, 
  FaTrophy, 
  FaUsers, 
  FaChartLine, 
  FaCube, 
  FaGamepad,
  FaArrowRight,
  FaStar,
  FaMedal,
  FaGraduationCap,
  FaLightbulb,
  FaAward,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import tncaBanner from '../assets/tncabanner1.jpg'
import cubeskoolBanner from '../assets/cubeskoolbanner1.jpg'
import tncaLogo from '../assets/tncalogo1.jpg'
import cubeskoolLogo from '../assets/cubeskoollogo1.png'
import MaintenanceWrapper from '../components/common/MaintenanceWrapper'

const Home = () => {
  const { user, isAuthenticated } = useAuth()

  const features = [
    {
      icon: <FaBrain className="w-8 h-8" />,
      title: "IQ Challenges",
      description: "Comprehensive IQ assessment quizzes designed by cognitive experts to test and enhance your intellectual capabilities."
    },
    {
      icon: <FaCube className="w-8 h-8" />,
      title: "Cube Games",
      description: "Interactive cube-solving challenges that enhance spatial reasoning, problem-solving, and cognitive flexibility."
    },
    {
      icon: <FaTrophy className="w-8 h-8" />,
      title: "Achievement System",
      description: "Earn badges and climb the leaderboard as you progress from Novice to Diamond Cubist with real-time tracking."
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your IQ growth with detailed analytics, performance insights, and personalized recommendations."
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Community",
      description: "Join the vibrant TNCA & Cubeskool community of learners, competitors, and cube enthusiasts."
    },
    {
      icon: <FaGamepad className="w-8 h-8" />,
      title: "Gamified Experience",
      description: "Enjoy a fun, engaging learning experience with rewards, achievements, and competitive challenges."
    }
  ]

  const achievements = [
    {
      number: "15+",
      label: "Years of Excellence",
      description: "Leading cube education in Tamil Nadu"
    },
    {
      number: "1000+",
      label: "Students Trained",
      description: "From beginners to world record holders"
    },
    {
      number: "50+",
      label: "Events Organized",
      description: "State, national & international competitions"
    },
    {
      number: "6",
      label: "Guinness Records",
      description: "World records set by our students"
    }
  ]

  const testimonials = [
    {
      name: "Jeshwanth Madasamy",
      role: "Parent",
      content: "My son gained confidence after Rubik's class. I feel proud that my son achieved Pyraminx world record and got 1st place in state level cube tournament. This kind of classes and competition is very important for new generation kids.",
      rating: 5,
      achievement: "Pyraminx World Record"
    },
    {
      name: "Hemachandrika R",
      role: "Parent",
      content: "The best coaching centre in India with world class masters to train even three year old kids with utmost patience. Kids acquire knowledge as well as create world records in this institution.",
      rating: 5,
      achievement: "Multiple World Records"
    },
    {
      name: "Saranya R",
      role: "Parent",
      content: "The teaching is excellent. The staffs are very patient and friendly to make the young kids understand the algorithms. They train them by giving more practice.",
      rating: 5,
      achievement: "4x4 Cube Expert"
    }
  ]

  const programs = [
    {
      icon: <FaGraduationCap className="w-6 h-6" />,
      title: "Blindfold Solving",
      description: "Enhance memory and visualization skills for improved focus and long-term retention."
    },
    {
      icon: <FaMedal className="w-6 h-6" />,
      title: "Speed Cubing",
      description: "Training for faster solving and competitions to sharpen speed and accuracy."
    },
    {
      icon: <FaCube className="w-6 h-6" />,
      title: "Cube Solving",
      description: "Master fundamental and advanced techniques for complex problem-solving."
    },
    {
      icon: <FaLightbulb className="w-6 h-6" />,
      title: "3D & 2D Mosaic Art",
      description: "Develop creativity and spatial intelligence for innovative thinking."
    }
  ]

  return (
    <MaintenanceWrapper routePath="/">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
                Unlock Your
                <span className="block text-yellow-300">Intellectual Potential</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Join TNCA & Cubeskool's gamified Iqualizer. 
                Test your intelligence, solve puzzles, and compete with the best minds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link
                    to={user?.role === 'admin' || user?.role === 'super_admin' ? '/admin' : '/dashboard'}
                    className="btn-primary text-lg px-8 py-4 inline-flex items-center"
                  >
                    Go to Dashboard
                    <FaArrowRight className="ml-2" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="btn-primary text-lg px-8 py-4 inline-flex items-center"
                  >
                    Get Started
                    <FaArrowRight className="ml-2" />
                  </Link>
                )}
                <Link
                  to="/about"
                  className="btn-outline text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="cube">
                <div className="cube-face cube-front"></div>
                <div className="cube-face cube-back"></div>
                <div className="cube-face cube-right"></div>
                <div className="cube-face cube-left"></div>
                <div className="cube-face cube-top"></div>
                <div className="cube-face cube-bottom"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of education and entertainment with our comprehensive Iqualizer platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A collaborative effort between TNCA and Cubeskool to bring you the best Iqualizer platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* TNCA Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="mb-6">
                <a 
                  href="https://tamilnaducubeassociation.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity duration-300"
                >
                  <img 
                    src={tncaBanner} 
                    alt="TNCA Banner" 
                    className="w-full h-auto object-contain rounded-lg shadow-lg mb-4 cursor-pointer"
                    style={{ maxHeight: '200px' }}
                  />
                  <img 
                    src={tncaLogo} 
                    alt="TNCA Logo" 
                    className="w-auto h-auto mx-auto lg:mx-0 object-contain max-h-20 cursor-pointer"
                    style={{ objectFit: 'contain' }}
                  />
                </a>
              </div>
              <a 
                href="https://tamilnaducubeassociation.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block hover:text-blue-600 transition-colors duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-blue-600">Tamil Nadu Cube Association</h3>
              </a>
              <p className="text-gray-600 mb-6">
                Leading the cube community in Tamil Nadu with innovative educational programs and competitive events. 
                Founded by Dr. R. Chandrika, "World Master of Cubes" with 15+ years of experience.
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Cube Education</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Competitions</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Community</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">World Records</span>
              </div>
            </motion.div>

            {/* Cubeskool Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="mb-6">
                <a 
                  href="https://cubeskool.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity duration-300"
                >
                  <img 
                    src={cubeskoolBanner} 
                    alt="Cubeskool Banner" 
                    className="w-full h-auto object-contain rounded-lg shadow-lg mb-4 cursor-pointer"
                    style={{ maxHeight: '200px' }}
                  />
                  <img 
                    src={cubeskoolLogo} 
                    alt="Cubeskool Logo" 
                    className="w-auto h-auto mx-auto lg:mx-0 object-contain max-h-20 cursor-pointer"
                    style={{ objectFit: 'contain' }}
                  />
                </a>
              </div>
              <a 
                href="https://cubeskool.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block hover:text-blue-600 transition-colors duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-blue-600">Cubeskool</h3>
              </a>
              <p className="text-gray-600 mb-6">
                Pioneering gamified learning experiences that make education engaging, interactive, and effective. 
                Specializing in innovative educational technology and cube-based learning solutions.
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Gamified Learning</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Interactive</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">Innovation</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">EdTech</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Specialized Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive training programs designed to develop cognitive skills and achieve excellence in cubing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-primary-600 mb-4 mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  {program.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {program.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Achievements
            </h2>
            <p className="text-xl text-blue-100">
              Celebrating years of excellence in cube education and cognitive development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-lg font-semibold mb-2">{achievement.label}</div>
                <div className="text-blue-100 text-sm">{achievement.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600">
              Real testimonials from parents and students who have experienced our platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 relative"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 w-5 h-5" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="mb-3">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
                <div className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                  {testimonial.achievement}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Boost Your IQ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your journey towards intellectual excellence today. 
              Join TNCA & Cubeskool's Iqualizer and unlock your potential.
            </p>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-100"
              >
                Continue Learning
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-100"
              >
                Get Started Now
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
    </MaintenanceWrapper>
  )
}

export default Home 