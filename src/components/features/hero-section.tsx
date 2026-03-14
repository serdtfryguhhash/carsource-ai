"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Zap, Box, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Zap, label: "Vehicles", value: "30+" },
  { icon: Box, label: "Parts", value: "100+" },
  { icon: TrendingUp, label: "Real HP Gains", value: "True" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117] to-[#0d1117]/95" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d1117] to-transparent" />

      {/* Content */}
      <div className="relative container mx-auto px-4 md:px-6 py-24 md:py-36 lg:py-44">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Build Your{" "}
              <span className="gradient-text">Dream Ride</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed"
          >
            Select your car. Choose your mods. See real performance gains.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white text-base px-8 py-6 rounded-xl gap-2 shadow-lg shadow-red-500/20"
            >
              <Link href="/garage">
                Select Your Car
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/15 text-gray-300 hover:text-white hover:border-white/30 text-base px-8 py-6 rounded-xl"
            >
              <Link href="/garage">
                Browse All Parts
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
            className="flex items-center justify-center gap-8 md:gap-12 pt-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5">
                <stat.icon className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
