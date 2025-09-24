'use client';

import { FC, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const roadmapItems = [
  {
    quarter: 'Q1 2024',
    title: 'Platform Launch',
    description: 'Initial release with core gaming features and NFT integration',
    color: '#d4a373'
  },
  {
    quarter: 'Q2 2024',
    title: 'AI Integration',
    description: 'Introduction of AI-powered NPCs and dynamic gameplay elements',
    color: '#ccd5ae'
  },
  {
    quarter: 'Q3 2024',
    title: 'Multiplayer Update',
    description: 'Launch of multiplayer features and community tournaments',
    color: '#e9edc9'
  },
  {
    quarter: 'Q4 2024',
    title: 'Ecosystem Expansion',
    description: 'Cross-chain compatibility and advanced trading features',
    color: '#fefae0'
  }
];

const Roadmap: FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={sectionRef} className="min-h-screen py-20 px-4 relative overflow-hidden bg-gradient-to-b from-[#1a1510] via-[#2a2015] to-[#1a1510]">
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-5" />
      
      <motion.div 
        style={{ scale, opacity }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#d4a373] mb-16">
          Roadmap
        </h2>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#d4a373] to-[#ccd5ae]" />
          
          <div className="space-y-24">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={item.quarter}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`relative ${index % 2 === 0 ? 'md:ml-auto md:pl-8' : 'md:mr-auto md:pr-8'} md:w-1/2`}
              >
                <div className="p-6 rounded-lg bg-[#2a2015]/50 backdrop-blur-sm border border-[#d4a373]/20">
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: item.color, color: '#1a1510' }}>
                    {item.quarter}
                  </span>
                  <h3 className="text-2xl font-bold text-[#e9edc9] mb-2">{item.title}</h3>
                  <p className="text-[#ccd5ae]">{item.description}</p>
                </div>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Roadmap;
