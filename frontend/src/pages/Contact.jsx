import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaComments,
  FaPaperPlane,
  FaCheckCircle,
  FaGlobe,
  FaWhatsapp
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset submission status after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="w-6 h-6" />,
      title: "Address",
      details: [
        "Av. #22 A, Kavitha street,",
        "UR Nagar, ParkRoad,",
        "Chennai-600101"
      ],
      link: null
    },
    {
      icon: <FaPhone className="w-6 h-6" />,
      title: "Phone Numbers",
      details: [
        "+91 8220713743",
        "+91 9500849544"
      ],
      link: "tel:+918220713743"
    },
    {
      icon: <FaEnvelope className="w-6 h-6" />,
      title: "Email",
      details: [
        "tamilnaducubeassociation@gmail.com"
      ],
      link: "mailto:tamilnaducubeassociation@gmail.com"
    },
    {
      icon: <FaClock className="w-6 h-6" />,
      title: "Office Hours",
      details: [
        "Monday - Friday",
        "9:00 AM - 5:00 PM"
      ],
      link: null
    }
  ];

  const quickLinks = [
    {
      title: "Visit TNCA Website",
      description: "Learn more about TNCA and their programs",
      link: "https://tamilnaducubeassociation.org/",
      icon: <FaGlobe className="w-5 h-5" />
    },
    {
      title: "WhatsApp Contact",
      description: "Quick chat with our team",
      link: "https://wa.me/918220713743",
      icon: <FaWhatsapp className="w-5 h-5" />
    },
    {
      title: "Email Support",
      description: "Send us an email for detailed inquiries",
      link: "mailto:tamilnaducubeassociation@gmail.com",
      icon: <FaEnvelope className="w-5 h-5" />
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
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
              Have questions about our Iqualizer platform or cube education programs? We'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4"
                >
                  <div className="text-primary-600 mt-1">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                    {info.link ? (
                      <a 
                        href={info.link} 
                        className="text-gray-600 hover:text-primary-600 transition-colors duration-300"
                      >
                        {info.details.map((detail, idx) => (
                          <div key={idx} className="text-gray-600">{detail}</div>
                        ))}
                      </a>
                    ) : (
                      <div>
                        {info.details.map((detail, idx) => (
                          <div key={idx} className="text-gray-600">{detail}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h3>
              <div className="space-y-4">
                {quickLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="text-primary-600 mr-4 group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                        {link.title}
                      </h4>
                      <p className="text-sm text-gray-600">{link.description}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h2>
            
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
              >
                <FaCheckCircle className="text-green-500 w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
                <p className="text-green-600">Thank you for contacting us. We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <FaPaperPlane className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-white rounded-lg shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose TNCA & Cubeskool?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-primary-600 mb-4 mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FaUser className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Expert Guidance</h4>
              <p className="text-gray-600">Learn from Dr. R. Chandrika, "World Master of Cubes" with 15+ years of experience.</p>
            </div>
            <div className="text-center">
              <div className="text-primary-600 mb-4 mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FaComments className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Personalized Support</h4>
              <p className="text-gray-600">Get personalized attention and support for your learning journey.</p>
            </div>
            <div className="text-center">
              <div className="text-primary-600 mb-4 mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FaGlobe className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Global Community</h4>
              <p className="text-gray-600">Join a worldwide community of cube enthusiasts and learners.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 