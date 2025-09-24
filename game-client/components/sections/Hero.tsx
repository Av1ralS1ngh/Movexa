'use client';

import { Button } from "@/components/ui/button";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useRouter } from "next/navigation";
import { FC } from 'react';
import { motion } from 'framer-motion';
import { usePrivyWallet } from "@/hooks/usePrivyWallet";

const Hero: FC = () => {
  const { connect: login, authenticated, logout } = usePrivyWallet();
  const router = useRouter();

  const handleGameLaunch = () => {
    router.push('/game');
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1510]/50 to-[#1a1510]" />
      
      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <div className="space-y-8">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d4a373] via-[#ccd5ae] to-[#e9edc9]">
              Aura Land
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-[#ccd5ae] max-w-2xl mx-auto leading-relaxed"
          >
            Chainless Conquests: Where NFTs Battle Across Realms, Rarity Reigns, and Legends are SoulBound.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            {!authenticated ? (
              <Button
                onClick={login}
                className="bg-gradient-to-r from-[#d4a373] to-[#ccd5ae] text-[#1a1510] px-8 py-3 rounded-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                onClick={handleGameLaunch}
                className="bg-gradient-to-r from-[#d4a373] to-[#ccd5ae] text-[#1a1510] px-8 py-3 rounded-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Launch Game
              </Button>
            )}
            
            <Button
              variant="outline"
              className="border-[#d4a373] text-[#d4a373] hover:bg-[#d4a373]/10"
              onClick={() => window.open('https://docs.blockgame.com', '_blank')}
            >
              Learn More
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center justify-center gap-8 mt-12"
          >
            {[
              { label: 'Players', value: '10K+' },
              { label: 'NFTs', value: '50K+' },
              { label: 'Transactions', value: '1M+' }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-[#e9edc9]">{stat.value}</p>
                <p className="text-[#ccd5ae]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-[#d4a373] rounded-full p-1">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="w-2 h-2 bg-[#d4a373] rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
