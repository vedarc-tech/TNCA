import React from 'react'
import { Link } from 'react-router-dom'
import { FaCube, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    social: [
      {
        name: 'Facebook',
        href: '#',
        icon: FaFacebook,
      },
      {
        name: 'Twitter',
        href: '#',
        icon: FaTwitter,
      },
      {
        name: 'Instagram',
        href: '#',
        icon: FaInstagram,
      },
      {
        name: 'LinkedIn',
        href: '#',
        icon: FaLinkedin,
      },
    ],
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <FaCube className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">TNCA Iqualizer</h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering minds through gamified IQ challenges and interactive learning experiences. 
              Join TNCA & Cubeskool in your journey towards intellectual excellence.
            </p>
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <FaEnvelope className="w-4 h-4 mr-3 text-primary-400" />
                <a href="mailto:tamilnaducubeassociation@gmail.com" className="hover:text-white transition-colors duration-200">
                  tamilnaducubeassociation@gmail.com
                </a>
              </li>
              <li className="flex items-center text-gray-300">
                <FaPhone className="w-4 h-4 mr-3 text-primary-400" />
                <span>+918220713743</span>
              </li>
              <li className="flex items-start text-gray-300">
                <FaMapMarkerAlt className="w-4 h-4 mr-3 mt-1 text-primary-400 flex-shrink-0" />
                <span>
                  Tamil Nadu Cube Association<br />
                  Chennai, Tamil Nadu, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} TNCA & Cubeskool Iqualizer. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Built with ❤️ for intellectual growth by{' '}
                <a 
                  href="https://www.vedarc.co.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline transition-colors duration-300"
                >
                  Vedarc Technologies Pvt. Ltd.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 