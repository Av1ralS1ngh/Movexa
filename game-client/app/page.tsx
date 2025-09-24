'use client';

import { GameScene } from "@/components/canvas/GameScene";
import Features from "@/components/sections/Features";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Roadmap from "@/components/sections/Roadmap";
import Community from "@/components/sections/Community";

export default function Home() {
  return (
    <main className="bg-[#1a1510]">
      <GameScene />
      <div className="relative">
        <Hero />
        <Features />
        <About />
        <Roadmap />
        <Community />
      </div>
    </main>
  );
}
