import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'
import axios from 'axios'
import { serverUrl } from '../App'

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await axios.post(`${serverUrl}/api/contact`, formData)
      setSuccess(res.data.message)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message! Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 px-4 sm:px-6 py-12">
      <div className='max-w-6xl mx-auto'>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-8 max-w-2xl mx-auto"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-8 max-w-2xl mx-auto"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className='grid lg:grid-cols-2 gap-12 items-start'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='bg-white border border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-xl'>
              <h2 className='text-3xl sm:text-4xl font-bold text-emerald-800 mb-8'>Get in Touch</h2>

              <div className='space-y-6 mb-10'>
                <div className='flex items-start gap-4'>
                  <div className='bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-100'>
                    <FaEnvelope size={22} />
                  </div>
                  <div>
                    <h4 className='font-bold text-base mb-1 text-emerald-800'>Email</h4>
                    <p className='text-gray-600 text-lg'>gauravasodariya44@gmail.com</p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-100'>
                    <FaPhoneAlt size={22} />
                  </div>
                  <div>
                    <h4 className='font-bold text-base mb-1 text-emerald-800'>Phone</h4>
                    <p className='text-gray-600 text-base'>+91 8799300210</p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-100'>
                    <FaMapMarkerAlt size={22} />
                  </div>
                  <div>
                    <h4 className='font-bold text-base mb-1 text-emerald-800'>Address</h4>
                    <p className='text-gray-600 text-base'>Gandhinagar, Gujarat, India</p>
                  </div>
                </div>
              </div>

              <div className='border-t border-gray-200 pt-8'>
                <h4 className='font-bold text-lg mb-5 text-emerald-800'>Follow Us</h4>
                <div className='flex gap-4'>
                  {[
                    { icon: <FaTwitter size={20} />, label: 'Twitter', color: 'text-blue-500' },
                    { icon: <FaLinkedin size={20} />, label: 'LinkedIn', color: 'text-blue-600' },
                    { icon: <FaInstagram size={20} />, label: 'Instagram', color: 'text-pink-500' }
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className={`${social.color} hover:opacity-80 transition cursor-pointer`}
                    >
                      <div className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl border border-gray-200 hover:border-emerald-100 transition-all">
                        {social.icon}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className='bg-white border border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-xl'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='block text-gray-800 font-semibold text-base'>Full Name</label>
                    <input
                      type='text'
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className='w-full px-5 py-4 border-0 rounded-2xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none transition-all text-base'
                      placeholder='Enter your full name'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='block text-gray-800 font-semibold text-base'>Email Address</label>
                    <input
                      type='email'
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className='w-full px-5 py-4 border-0 rounded-2xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none transition-all text-base'
                      placeholder='Enter your email address'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='block text-gray-800 font-semibold text-base'>Subject</label>
                  <input
                    type='text'
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className='w-full px-5 py-4 border-0 rounded-2xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none transition-all text-base'
                    placeholder='How can we help?'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='block text-gray-800 font-semibold text-base'>Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className='w-full px-5 py-4 border-0 rounded-2xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none resize-none text-base'
                    placeholder='Tell us more about your inquiry...'
                  />
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-2xl font-bold text-lg shadow-xl transition-all hover:shadow-2xl cursor-pointer'
                >
                  {loading ? (
                    <div className='flex items-center justify-center gap-2'>
                      <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      <span>Sending...</span>
                    </div>
                  ) : 'Send Message'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact