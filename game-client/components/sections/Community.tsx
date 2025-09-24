'use client';

import { FC, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaDiscord, FaTwitter, FaTelegram } from 'react-icons/fa';

const Community: FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={sectionRef} className="min-h-screen py-20 px-4 relative overflow-hidden bg-gradient-to-b from-[#1a1510] via-[#2a2015] to-[#1a1510]">
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-5" />
      
      <motion.div 
        style={{ y, opacity }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#d4a373]">
            Join Our Community
          </h2>
          <p className="mt-4 text-lg text-[#ccd5ae] max-w-2xl mx-auto">
            Connect with fellow players, stay updated with the latest news, and participate in exclusive events.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FaDiscord, name: 'Discord', members: '50K+', color: '#d4a373' },
            { icon: FaTwitter, name: 'Twitter', members: '25K+', color: '#ccd5ae' },
            { icon: FaTelegram, name: 'Telegram', members: '15K+', color: '#e9edc9' }
          ].map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group"
            >
              <div className="p-8 rounded-lg bg-[#2a2015]/50 backdrop-blur-sm border border-[#d4a373]/20 hover:border-[#d4a373] transition-colors">
                <platform.icon className="w-12 h-12 mx-auto mb-4" style={{ color: platform.color }} />
                <h3 className="text-2xl font-bold text-[#e9edc9] mb-2">{platform.name}</h3>
                <p className="text-[#ccd5ae] mb-4">{platform.members} members</p>
                <button className="px-6 py-2 rounded-full text-[#1a1510] font-semibold transition-transform transform hover:scale-105" style={{ backgroundColor: platform.color }}>
                  Join Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-20 p-8 rounded-lg bg-[#2a2015]/50 backdrop-blur-sm border border-[#d4a373]/20 text-center"
        >
          <h3 className="text-2xl font-bold text-[#e9edc9] mb-4">Stay Updated</h3>
          <p className="text-[#ccd5ae] mb-6">Subscribe to our newsletter for exclusive updates and rewards</p>
          <div className="flex max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded-l-lg bg-[#1a1510] text-[#e9edc9] border border-[#d4a373]/20 focus:outline-none focus:border-[#d4a373]"
            />
            <button className="px-6 py-2 rounded-r-lg bg-[#d4a373] text-[#1a1510] font-semibold hover:bg-[#ccd5ae] transition-colors">
              Subscribe
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Community;
