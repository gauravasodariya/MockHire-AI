import React from 'react'
import { BsRobot } from "react-icons/bs"
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa"
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-black text-white p-2 rounded-lg">
                <img src="/4.png" alt="Logo" className="h-5 w-5 object-contain" />
              </div>
              <h2 className="font-semibold">MockHire AI</h2>
            </div>
            <p className="text-md text-gray-500 leading-relaxed mb-4">
              AI-powered mock interviews to help you prepare, practice, and perform better.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-black transition cursor-pointer">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-black transition cursor-pointer">
                <FaLinkedin size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-black transition cursor-pointer">
                <FaGithub size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-black transition cursor-pointer">
                <FaInstagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-md mb-3">Product</h3>
            <ul className="space-y-2 text-md text-gray-500">
              <li><Link to="/interview" className="hover:text-black transition">Start Interview</Link></li>
              <li><Link to="/history" className="hover:text-black transition">Interview History</Link></li>
              <li><Link to="/pricing" className="hover:text-black transition">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-md mb-3">Company</h3>
            <ul className="space-y-2 text-md text-gray-500">
              <li><Link to="/about" className="hover:text-black transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-black transition">Contact</Link></li>
              <li><Link to="/careers" className="hover:text-black transition">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-md mb-3">Contact Us</h3>
            <ul className="space-y-2 text-md text-gray-500">
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt size={14} className="text-gray-500 shrink-0" />
                Ahmedabad, Gujarat
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope size={14} className="text-gray-500 shrink-0" />
                <a href="mailto:gauravasodariya44@gmail.com" className="hover:text-black transition">
                  gauravasodariya44@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt size={14} className="text-gray-500 shrink-0" />
                <a href="tel:+918799300210" className="hover:text-black transition">
                  +91 8799300210
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-5 pt-5 flex justify-center">
          <p className="text-md text-gray-500 text-center">
            © {new Date().getFullYear()} MockHire AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer