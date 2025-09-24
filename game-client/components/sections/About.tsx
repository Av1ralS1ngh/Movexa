'use client';

import { FC, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const About: FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="min-h-screen py-20 px-4 relative overflow-hidden bg-gradient-to-b from-[#1a1510] via-[#2a2015] to-[#1a1510]">
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-5" />
      
      <motion.div 
        style={{ y, opacity }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-[#d4a373]">
              About Block Game
            </h2>
            <p className="text-lg text-[#ccd5ae] leading-relaxed">
              Immerse yourself in a revolutionary gaming experience where blockchain technology meets artificial intelligence. Our platform bridges the gap between traditional gaming and Web3, creating an ecosystem where every achievement matters.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-lg bg-[#2a2015]/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-[#e9edc9] mb-2">10K+</h3>
                <p className="text-[#ccd5ae]">Active Players</p>
              </div>
              <div className="p-6 rounded-lg bg-[#2a2015]/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-[#e9edc9] mb-2">50K+</h3>
                <p className="text-[#ccd5ae]">NFTs Minted</p>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d4a373] to-[#ccd5ae] rounded-lg transform rotate-6 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
