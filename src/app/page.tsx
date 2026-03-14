"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Car, Wrench, Gauge, ArrowRight, Zap, TrendingUp, Volume2,
  ChevronRight, Trophy, Users, Layers, BookOpen, Eye, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vehicles } from "@/data/vehicles";
import { modParts, getPopularParts } from "@/data/parts";
import VehicleSelectCard from "@/components/features/vehicle-select-card";
import PartCard from "@/components/features/part-card";
import HeroSection from "@/components/features/hero-section";
import XPBar from "@/components/shared/XPBar";
import StreakBadge from "@/components/shared/StreakBadge";
import AchievementToast from "@/components/shared/AchievementToast";
import { useAppStore } from "@/stores";
import type { ModCategory } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const steps = [
  {
    icon: Car,
    title: "Select Your Ride",
    description: "Pick your car make and model from our extensive database of mod-friendly vehicles.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: Wrench,
    title: "Choose Your Mods",
    description: "Browse performance parts by category: intakes, exhausts, turbos, suspension, and more.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: Gauge,
    title: "See the Results",
    description: "Real HP, torque, and performance gains. Watch your build stats update in real time.",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
];

const quickLinks = [
  { href: "/garage", icon: Car, label: "My Garage", color: "text-red-400", bg: "bg-red-500/10" },
  { href: "/build-planner", icon: Layers, label: "Build Planner", color: "text-orange-400", bg: "bg-orange-500/10" },
  { href: "/diary", icon: BookOpen, label: "Mod Diary", color: "text-purple-400", bg: "bg-purple-500/10" },
  { href: "/community", icon: Users, label: "Community", color: "text-blue-400", bg: "bg-blue-500/10" },
  { href: "/maintenance", icon: Settings, label: "Maintenance", color: "text-green-400", bg: "bg-green-500/10" },
  { href: "/watchlist", icon: Eye, label: "Watchlist", color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

const modCategories: { name: ModCategory; icon: typeof Wrench; description: string }[] = [
  { name: "Engine", icon: Zap, description: "Internal engine upgrades" },
  { name: "Exhaust", icon: Volume2, description: "Headers, downpipes, cat-backs" },
  { name: "Turbo & Supercharger", icon: TrendingUp, description: "Forced induction kits" },
  { name: "Intake", icon: Gauge, description: "Cold air intakes & filters" },
  { name: "Suspension", icon: Car, description: "Coilovers, sway bars, arms" },
  { name: "ECU & Tuning", icon: Wrench, description: "Tunes, piggybacks, flash kits" },
];

export default function HomePage() {
  const recordVisit = useAppStore((s) => s.recordVisit);
  const communityBuilds = useAppStore((s) => s.communityBuilds);
  const userVehicles = useAppStore((s) => s.vehicles);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    recordVisit();
  }, [recordVisit]);

  const featuredBuild = communityBuilds.find((b) => b.featured) || communityBuilds[0];
  const popularVehicles = vehicles.slice(0, 8);

  let popularParts: typeof modParts = [];
  try {
    popularParts = getPopularParts ? getPopularParts() : modParts.filter((p) => p.is_popular).slice(0, 8);
  } catch {
    popularParts = modParts.filter((p) => p.is_popular).slice(0, 8);
  }
  if (popularParts.length === 0) {
    popularParts = modParts.slice(0, 8);
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <AchievementToast />

      {/* Hero Section */}
      <HeroSection />

      {/* User Dashboard (only if they have activity) */}
      {mounted && (xp > 0 || userVehicles.length > 0 || streak.currentStreak > 0) && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Your Progress</h2>
                <StreakBadge />
              </div>
              <XPBar />
            </motion.div>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-3 md:grid-cols-6 gap-3"
          >
            {quickLinks.map((link) => (
              <motion.div key={link.href} variants={fadeInUp} transition={{ duration: 0.3 }}>
                <Link href={link.href}>
                  <Card className="bg-white/5 border-white/10 hover:border-red-500/30 transition-all cursor-pointer card-glow h-full">
                    <CardContent className="p-4 text-center">
                      <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center mx-auto mb-2`}>
                        <link.icon className={`w-5 h-5 ${link.color}`} />
                      </div>
                      <p className="text-xs font-medium text-zinc-300">{link.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Community Build */}
      {mounted && featuredBuild && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Featured Community Build</h2>
              </div>
              <Link href="/community">
                <Card className="bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs mb-2">
                          <Trophy className="w-3 h-3 mr-1" /> Build of the Week
                        </Badge>
                        <h3 className="text-xl font-bold text-white">{featuredBuild.vehicleName}</h3>
                        <p className="text-sm text-zinc-500">by {featuredBuild.userName}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm text-green-400 font-medium">{featuredBuild.currentHP} HP</span>
                          <span className="text-sm text-yellow-400">${featuredBuild.totalInvested.toLocaleString()}</span>
                          <span className="text-sm text-zinc-400">{featuredBuild.modList.length} mods</span>
                          <span className="text-sm text-blue-400">{featuredBuild.upvotes} upvotes</span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-zinc-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Build Your Dream Car in{" "}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              From stock to built - see exactly what each mod does to your car before you buy.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div key={step.title} variants={fadeInUp} transition={{ duration: 0.5 }}>
                <Card className={`relative overflow-hidden bg-white/5 border ${step.border} hover:bg-white/[0.08] transition-all duration-300 card-glow h-full`}>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mx-auto`}>
                        <step.icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Vehicles */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">
                Popular Platforms
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Popular Vehicles
              </h2>
              <p className="text-zinc-400 mt-2">The most modded cars in the community</p>
            </div>
            <Link href="/garage">
              <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hidden md:flex">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {popularVehicles.map((vehicle) => (
              <motion.div key={vehicle.id} variants={fadeInUp} transition={{ duration: 0.4 }}>
                <VehicleSelectCard vehicle={vehicle} />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/garage">
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                View All Vehicles <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Mods */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-400">
                Trending
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Trending Mods
              </h2>
              <p className="text-zinc-400 mt-2">The hottest parts the community is running</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {popularParts.map((part) => (
              <motion.div key={part.id} variants={fadeInUp} transition={{ duration: 0.4 }}>
                <PartCard part={part} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mod Categories */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">
              Categories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mod Categories
            </h2>
            <p className="text-zinc-400 text-lg">Browse parts by modification type</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {modCategories.map((cat) => (
              <motion.div key={cat.name} variants={fadeInUp} transition={{ duration: 0.3 }}>
                <Link href="/garage">
                  <Card className="bg-white/5 border-white/10 hover:border-red-500/40 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer card-glow group h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-red-500/20 transition-colors">
                        <cat.icon className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{cat.name}</h3>
                      <p className="text-xs text-zinc-500">{cat.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/10 to-red-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-12 md:p-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to <span className="gradient-text">Build?</span>
                </h2>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
                  Select your car, pick your parts, and see exactly how each modification
                  transforms your ride. Real numbers, real results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/garage">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold rounded-xl w-full sm:w-auto">
                      Start Your Build <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/advisor">
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl w-full sm:w-auto">
                      Ask AI Advisor <Zap className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
