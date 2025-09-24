'use client';

import { FaEye, FaSkull, FaGhost } from "react-icons/fa";
import { IconType } from "react-icons";
import { FC } from 'react';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: IconType;
  gradient: string;
}

const features: Feature[] = [
  {
    title: "Omniscient Eyes",
    description: "Each NFT eye possesses unique abilities and watches over your every move in the game.",
    icon: FaEye,
    gradient: "from-[#d4a373] to-[#ccd5ae]"
  },
  {
    title: "Haunted Realms",
    description: "Navigate through eerie landscapes where AI-powered entities adapt to your fears.",
    icon: FaGhost,
    gradient: "from-[#ccd5ae] to-[#e9edc9]"
  },
  {
    title: "Soul Harvesting",
    description: "Collect and evolve your eye NFTs by absorbing the essence of defeated opponents.",
    icon: FaSkull,
    gradient: "from-[#e9edc9] to-[#d4a373]"
  }
];

const Features: FC = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden bg-[#1a1510]">
      {/* Animated eye background */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <FaEye className="text-[#d4a373] w-8 h-8" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#d4a373] mb-4">
            Embrace the Darkness
          </h2>
          <p className="text-[#ccd5ae] text-lg max-w-2xl mx-auto">
            Enter a realm where eyes are the windows to power, and every blink could be your last
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group"
            >
              <div className="p-8 rounded-lg bg-[#2a2015]/50 backdrop-blur-sm border border-[#d4a373]/20 hover:border-[#d4a373] transition-colors relative overflow-hidden">
                {/* Animated eye in background */}
                <motion.div
                  className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  <feature.icon className="w-32 h-32" />
                </motion.div>

                <feature.icon className="w-12 h-12 mb-4" style={{ color: '#d4a373' }} />
                <h3 className="text-2xl font-bold text-[#e9edc9] mb-2">{feature.title}</h3>
                <p className="text-[#ccd5ae]">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
