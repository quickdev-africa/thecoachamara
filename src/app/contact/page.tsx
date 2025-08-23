"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn, fadeInUp } from "../fadeMotion";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission - replace with actual form handling
    try {
      // This is where you'd integrate with your form handling service
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* HEADER / NAVIGATION */}
      <motion.header
        className="w-full bg-white border-b border-gray-200 sticky top-0 z-20"
        initial="hidden"
        animate="show"
        variants={fadeInUp}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-2 md:px-4 py-4 md:py-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Coach Amara"
              width={100}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </a>
          {/* Menu */}
          <div className="flex items-center gap-1 md:gap-4">
            <a href="/shop" className="px-2 md:px-5 py-1 md:py-2 rounded-full font-semibold text-black hover:bg-gray-100 transition text-xs md:text-base whitespace-nowrap">Web Store</a>
            <a href="/join" className="px-2 md:px-6 py-1 md:py-2 rounded-full font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all text-xs md:text-base whitespace-nowrap">Join the Community</a>
          </div>
        </nav>
      </motion.header>

      <main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black">
        {/* HERO SECTION */}
        <motion.section
          className="w-full flex flex-col items-center justify-center py-16 md:py-28 px-2 md:px-4 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-500/10" />
            <div className="absolute top-10 left-10 w-16 h-16 md:w-32 md:h-32 border border-yellow-400/20 rotate-45"></div>
            <div className="absolute bottom-20 right-10 w-12 h-12 md:w-24 md:h-24 border border-yellow-400/30 rotate-12"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 md:w-16 md:h-16 border border-yellow-400/25 rotate-90"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight font-playfair drop-shadow-2xl">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent block">Get in Touch</span>
              <span className="text-white block mt-2">Let's Start Your Transformation Journey</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-8 md:mb-10 text-gray-200 max-w-3xl mx-auto px-2">
              Ready to discover the power of <span className="text-yellow-400 font-bold">Quantum Energy</span>? Have questions about our community? I'm here to help you take the next step.
            </p>
          </div>
        </motion.section>

        {/* CONTACT METHODS SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-gray-50 flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair text-center drop-shadow">How to Reach Me</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-12 mx-auto"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Join Community */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-400 hover:shadow-2xl transition-shadow duration-300"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-6">
                  <svg width="36" height="36" fill="currentColor" viewBox="0 0 20 20" className="text-black">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-black">Join Our Community</h3>
                <p className="text-gray-700 font-semibold mb-6">
                  The best way to connect with me and get ongoing support is through our vibrant community of like-minded individuals.
                </p>
                <a href="/join" className="inline-block px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 transition-all duration-200">
                  Join Now
                </a>
              </motion.div>

              {/* Business Inquiries */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-400 hover:shadow-2xl transition-shadow duration-300"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-6">
                  <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-black">Business & Partnerships</h3>
                <p className="text-gray-700 font-semibold mb-6">
                  For speaking engagements, business partnerships, or collaboration opportunities with Maralis Solutions.
                </p>
                <a href="https://maralissolutions.com" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 rounded-full text-base font-bold border-2 border-yellow-400 text-black hover:bg-yellow-400 transition-all duration-200">
                  Visit Maralis Solutions
                </a>
              </motion.div>

              {/* Support & Questions */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-400 hover:shadow-2xl transition-shadow duration-300"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-6">
                  <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-black">Questions & Support</h3>
                <p className="text-gray-700 font-semibold mb-6">
                  Have questions about Quantum Energy tools, community membership, or need personalized guidance?
                </p>
                <a href="#contact-form" className="inline-block px-6 py-3 rounded-full text-base font-bold bg-black text-yellow-400 hover:bg-gray-800 transition-all duration-200">
                  Send Message
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* CONTACT FORM SECTION */}
        <motion.section
          id="contact-form"
          className="w-full py-20 px-4 bg-white flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair text-center drop-shadow">Send Me a Message</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-8 mx-auto"></div>
            <p className="text-lg md:text-xl font-semibold mb-12 text-gray-700 text-center max-w-2xl mx-auto">
              Whether you're curious about Quantum Energy, need guidance on your wellness journey, or want to explore partnership opportunities, I'd love to hear from you.
            </p>

            <div className="bg-black rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-yellow-400">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-yellow-400 font-bold mb-2">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded border-2 border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-yellow-400 font-bold mb-2">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded border-2 border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-yellow-400 font-bold mb-2">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded border-2 border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg"
                  >
                    <option value="">Select a topic...</option>
                    <option value="quantum-energy">Questions about Quantum Energy</option>
                    <option value="community">Community Membership</option>
                    <option value="coaching">Personal Coaching</option>
                    <option value="business">Business/Partnership Inquiry</option>
                    <option value="speaking">Speaking Engagement</option>
                    <option value="support">Support & Technical Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-yellow-400 font-bold mb-2">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded border-2 border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg resize-vertical"
                    placeholder="Tell me about your goals, questions, or how I can help you on your transformation journey..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-900 border-2 border-green-400 text-green-400 p-4 rounded-lg text-center font-semibold">
                    ✅ Thank you for your message! I'll get back to you within 24-48 hours.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-900 border-2 border-red-400 text-red-400 p-4 rounded-lg text-center font-semibold">
                    ❌ There was an error sending your message. Please try again or contact me directly through the community.
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.section>

        {/* COMMUNITY INVITATION SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-gray-50 flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair drop-shadow">Join the Movement</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-8 mx-auto"></div>
            <p className="text-lg md:text-xl font-semibold mb-8 text-gray-700 max-w-2xl mx-auto">
              Don't wait to start your transformation. Join over 1,000 individuals who are already experiencing the life-changing power of Quantum Energy.
            </p>
            
            <div className="bg-black rounded-3xl shadow-2xl p-10 border-2 border-yellow-400 mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400">Why Join Our Community?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <ul className="space-y-3 text-white">
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">🚀</span> Fast-track your transformation journey</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">💡</span> Get direct access to Coach Amara's insights</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">🤝</span> Connect with like-minded individuals</li>
                </ul>
                <ul className="space-y-3 text-white">
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">⚡</span> Learn proven Quantum Energy techniques</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">📈</span> Track your progress with support</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">🎯</span> Get personalized guidance and feedback</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/join"
                className="inline-block px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200"
              >
                Join the Community
              </a>
              <a
                href="/about"
                className="inline-block px-8 py-4 rounded-full text-lg font-bold border-2 border-yellow-400 text-black hover:bg-yellow-400 hover:text-black transition-all duration-200"
              >
                Learn About Coach Amara
              </a>
            </div>
          </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="w-full py-8 px-4 bg-black text-white flex flex-col items-center border-t-2 border-yellow-400 mt-8">
          <div className="flex gap-6 mb-4 flex-wrap justify-center">
            <a href="/about" className="hover:text-yellow-400 transition-colors font-bold">About Amara</a>
            <a href="/contact" className="hover:text-yellow-400 transition-colors font-bold">Contact Us</a>
            <a href="/shop" className="hover:text-yellow-400 transition-colors font-bold">Shop</a>
            <a href="https://maralissolutions.com" className="hover:text-yellow-400 transition-colors font-bold" target="_blank" rel="noopener noreferrer">Maralis Solutions</a>
          </div>
          <p className="text-gray-400 text-sm text-center">&copy; {new Date().getFullYear()} TheCoachAmara.com. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
