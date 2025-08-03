import React from "react";
import { motion } from "framer-motion";
import { 
  FaAward, 
  FaGraduationCap, 
  FaUsers, 
  FaTrophy, 
  FaMedal, 
  FaLightbulb,
  FaCube,
  FaEye,
  FaHandsHelping,
  FaGlobe,
  FaStar,
  FaCheckCircle,
  FaHeart,
  FaHandshake,
  FaUniversity,
  FaChild
} from "react-icons/fa";
import tncaLogo from "../assets/tncalogo1.jpg";
import cubeskoolLogo from "../assets/cubeskoollogo1.png";
import tncaBanner from "../assets/tncabanner1.jpg";
import cubeskoolBanner from "../assets/cubeskoolbanner1.jpg";

const About = () => {
  const tncaAchievements = [
    {
      icon: <FaAward className="w-6 h-6" />,
      title: "World Master of Cubes",
      description: "Dr. R. Chandrika recognized by former Education Minister of Tamil Nadu"
    },
    {
      icon: <FaTrophy className="w-6 h-6" />,
      title: "6 Guinness World Records",
      description: "Students trained to achieve world records in Rubik's Cube solving"
    },
    {
      icon: <FaHandsHelping className="w-6 h-6" />,
      title: "Inclusive Learning",
      description: "Trained 100 blind and 45 deaf-mute students in cube solving"
    },
    {
      icon: <FaGlobe className="w-6 h-6" />,
      title: "Global Recognition",
      description: "Honored by government institutions and major newspapers"
    }
  ];

  const cubeskoolFeatures = [
    {
      icon: <FaLightbulb className="w-6 h-6" />,
      title: "Innovative EdTech",
      description: "Cutting-edge technology for gamified learning experiences"
    },
    {
      icon: <FaCube className="w-6 h-6" />,
      title: "Cube-Based Learning",
      description: "Specialized in cube education and cognitive development"
    },
    {
      icon: <FaUsers className="w-6 h-6" />,
      title: "Interactive Platform",
      description: "Engaging learning experiences for all age groups"
    },
    {
      icon: <FaStar className="w-6 h-6" />,
      title: "Quality Education",
      description: "Proven methodologies for effective skill development"
    }
  ];

  const programs = [
    {
      title: "Blindfold Solving",
      description: "Enhancing memory and visualization skills for improved focus and long-term retention.",
      benefits: ["Memory Enhancement", "Visualization Skills", "Focus Improvement"]
    },
    {
      title: "Speed Cubing",
      description: "Training for faster solving and competitions to sharpen speed and accuracy.",
      benefits: ["Speed Training", "Competition Prep", "Accuracy Development"]
    },
    {
      title: "Cube Solving",
      description: "Mastering fundamental and advanced techniques for complex problem-solving.",
      benefits: ["Problem Solving", "Algorithm Mastery", "Technique Development"]
    },
    {
      title: "3D & 2D Mosaic Art",
      description: "Developing creativity and spatial intelligence for innovative thinking.",
      benefits: ["Creativity", "Spatial Intelligence", "Innovation"]
    },
    {
      title: "Puzzle Activities",
      description: "Puzzle activities boost logic, patience, and concentration.",
      benefits: ["Logical Thinking", "Patience", "Concentration"]
    },
    {
      title: "World Record Training",
      description: "Specialized coaching for record-breaking performance.",
      benefits: ["Specialized Coaching", "Record Breaking", "Performance Optimization"]
    }
  ];

  const notableAchievements = [
    "Received the title \"World Master of Cube\" from Mr. Pandiyarajan, Former Education Minister of Tamil Nadu.",
    "Conducted a special workshop at Dr. M.G.R. Medical University; honored by Mr. A.C. Shanmugam and Mr. ACS Arun Kumar.",
    "Trained 6 students to set Guinness World Records in Rubik's Cube solving.",
    "Trained 100 blind and 45 deaf-mute students to learn cube solving techniques.",
    "Designed and distributed Braille Cubes across Tamil Nadu to support inclusive learning."
  ];

  const awards = [
    {
      icon: <FaMedal className="w-5 h-5" />,
      title: "Mahanati Savitri Award",
      description: "Social Development (Rapalli)"
    },
    {
      icon: <FaTrophy className="w-5 h-5" />,
      title: "Tamil Nadu Social Development Award",
      description: "Field of Rubik's Cube (by Siwaa)"
    },
    {
      icon: <FaHeart className="w-5 h-5" />,
      title: "Empowering Women Growth Award",
      description: "For her contribution to cubing education (by Welled)"
    },
    {
      icon: <FaStar className="w-5 h-5" />,
      title: "Triumph Records",
      description: "For rural Rubik's Cube training"
    },
    {
      icon: <FaUniversity className="w-5 h-5" />,
      title: "Velammal Vidyalaya Felicitation",
      description: "From Mr. M.V.M. Velmohan"
    },
    {
      icon: <FaHandshake className="w-5 h-5" />,
      title: "Recognition by Mrs. Latha Rajinikanth",
      description: "For training underprivileged children in Cubing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
              About TNCA & Cubeskool
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
              A powerful collaboration between two industry leaders to revolutionize IQ development and cube education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Partnership Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Partnership
          </h2>
          <div className="flex justify-center items-center space-x-8 mb-8">
            <a 
              href="https://tamilnaducubeassociation.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity duration-300"
            >
              <img 
                src={tncaLogo} 
                alt="TNCA Logo" 
                className="w-auto h-auto max-h-24 cursor-pointer"
                style={{ objectFit: 'contain' }}
              />
            </a>
            <span className="text-4xl font-bold text-gray-400">&</span>
            <a 
              href="https://cubeskool.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity duration-300"
            >
              <img 
                src={cubeskoolLogo} 
                alt="Cubeskool Logo" 
                className="w-auto h-auto max-h-24 cursor-pointer"
                style={{ objectFit: 'contain' }}
              />
            </a>
          </div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            This platform represents the perfect synergy between TNCA's expertise in cube education and Cubeskool's innovative gamified learning technology.
          </p>
        </motion.div>

        {/* TNCA Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
        >
          <div>
            <a 
              href="https://tamilnaducubeassociation.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity duration-300"
            >
              <img 
                src={tncaBanner} 
                alt="TNCA Banner" 
                className="w-full h-auto object-contain rounded-lg shadow-lg cursor-pointer"
                style={{ maxHeight: '300px' }}
              />
            </a>
          </div>
          <div>
            <a 
              href="https://tamilnaducubeassociation.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:text-blue-600 transition-colors duration-300"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6 cursor-pointer hover:text-blue-600">Tamil Nadu Cube Association (TNCA)</h3>
            </a>
            <p className="text-lg text-gray-600 mb-6">
              TNCA is the premier organization dedicated to promoting cube education and competitive solving in Tamil Nadu. 
              With years of experience in organizing competitions and educational programs, TNCA has been at the forefront 
              of developing cube-solving skills and fostering a vibrant community of enthusiasts.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Organizing state-level cube competitions</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Providing cube education programs</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Building a strong cube community</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Promoting intellectual development</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dr. R. Chandrika Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-lg shadow-lg p-8 mb-20"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="https://tamilnaducubeassociation.org/assets/img/Chandrika.jpeg" 
                alt="Dr. R. Chandrika" 
                className="w-56 h-56 rounded-full object-cover shadow-lg border-4 border-primary-100"
                style={{ 
                  objectPosition: 'center 20%'
                }}
              />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Dr. R. Chandrika</h3>
            <p className="text-lg text-gray-600 mb-6">
              🎓 President – Tamil Nadu Cube Association | 🎓 Child and Adolescent Counselor | 🎓 Special Designer – Braille Rubik's Cubes | 🎓 World Master of Cubes
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-600 mb-6">
                Dr. R. Chandrika is a leading figure in the world of speed cubing, child development, and cognitive skill training. 
                With over 15 years of experience, she has mentored thousands of students, guiding many to achieve national and world 
                records in Rubik's Cube solving. Her dedication to inclusive learning earned her the title "World Master of Cubes", 
                and she's renowned as the special designer of Braille Rubik's Cubes, making cubing accessible for the visually impaired 
                and deaf-mute communities.
              </p>
              
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Notable Achievements</h4>
                {notableAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 w-5 h-5 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Awards & Honors</h4>
              <div className="space-y-4">
                {awards.map((award, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                  >
                    <div className="text-primary-600 mt-1 flex-shrink-0">
                      {award.icon}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">{award.title}</h5>
                      <p className="text-gray-600 text-sm">{award.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cubeskool Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
        >
          <div>
            <a 
              href="https://cubeskool.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:text-blue-600 transition-colors duration-300"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6 cursor-pointer hover:text-blue-600">Cubeskool</h3>
            </a>
            <p className="text-lg text-gray-600 mb-6">
              Cubeskool is a pioneering educational technology company that specializes in gamified learning experiences. 
              By combining cutting-edge technology with proven educational methodologies, Cubeskool creates engaging 
              platforms that make learning fun, interactive, and effective for students of all ages.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Gamified learning experiences</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Interactive educational platforms</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Cognitive skill development</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Innovative teaching methodologies</span>
              </div>
            </div>
          </div>
          <div>
            <a 
              href="https://cubeskool.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity duration-300"
            >
              <img 
                src={cubeskoolBanner} 
                alt="Cubeskool Banner" 
                className="w-full h-auto object-contain rounded-lg shadow-lg cursor-pointer"
                style={{ maxHeight: '300px' }}
              />
            </a>
          </div>
        </motion.div>

        {/* Programs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Our Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <div className="space-y-2">
                  {program.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center">
                      <FaCheckCircle className="text-green-500 w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            TNCA Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tncaAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {achievement.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cubeskool Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Cubeskool Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cubeskoolFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-secondary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-lg p-12 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the IQ Revolution
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Experience the power of collaborative learning with TNCA's expertise and Cubeskool's innovative technology. 
            Start your journey towards enhanced cognitive skills and intellectual development today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="btn-secondary text-lg px-8 py-3"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="btn-outline-secondary text-lg px-8 py-3"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 