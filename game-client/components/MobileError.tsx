'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FaDesktop, FaMobileAlt } from 'react-icons/fa';
import { TextGenerateEffect } from './ui/text-generate-effect';

const MobileError: FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1a1510] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2a2015]/80 border-[#d4a373] backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-[#8B0000] text-6xl"
            >
              <FaMobileAlt />
            </motion.div>
          </div>

          <div className="space-y-4 text-center">
            <TextGenerateEffect
              words="Mobile Access Restricted"
              className="text-2xl font-bold text-[#d4a373]"
            />

            <p className="text-[#ccd5ae]">
              EyeRealm is designed for desktop gameplay to ensure the best experience.
              Please access the game from a desktop browser.
            </p>

            <div className="flex items-center justify-center gap-2 text-[#e9edc9] my-4">
              <FaMobileAlt className="text-2xl text-[#8B0000]" />
              <span className="text-2xl">→</span>
              <FaDesktop className="text-2xl text-[#4B0082]" />
            </div>

            <div className="pt-4">
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-[#8B0000] to-[#4B0082] text-white hover:opacity-90 transition-opacity"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </motion.div>
      </Card>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: i % 2 === 0 ? '#8B0000' : '#4B0082',
            }}
          >
            <FaMobileAlt className="text-2xl opacity-20" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobileError;
