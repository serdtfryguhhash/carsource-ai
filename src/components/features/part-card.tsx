"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Zap,
  Cog,
  Weight,
  Volume2,
  Star,
  Clock,
  AlertTriangle,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const difficultyConfig: Record<string, { color: string; label: string }> = {
  "bolt-on": { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Bolt-On" },
  "Bolt-On": { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Bolt-On" },
  moderate: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Moderate" },
  Moderate: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Moderate" },
  advanced: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "Advanced" },
  Advanced: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "Advanced" },
  "professional-only": { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Professional Only" },
  "Professional Only": { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Professional Only" },
};

const soundConfig: Record<string, { color: string; pulse?: boolean }> = {
  Stock: { color: "text-gray-500" },
  Mild: { color: "text-blue-400" },
  Moderate: { color: "text-yellow-400" },
  Loud: { color: "text-orange-400" },
  "Very Loud": { color: "text-red-400" },
  Race: { color: "text-red-500", pulse: true },
};

function formatPrice(price: number | undefined) {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function StatValue({ value, unit, positive }: { value: number; unit: string; positive: "higher" | "lower" }) {
  if (!value || value === 0) return <span className="stat-neutral">+0 {unit}</span>;
  const isGood = positive === "higher" ? value > 0 : value < 0;
  const prefix = value > 0 ? "+" : "";
  return (
    <span className={isGood ? "stat-positive" : "stat-negative"}>
      {prefix}
      {value} {unit}
    </span>
  );
}

export default function PartCard({ part, index = 0 }: { part: any; index?: number }) {
  const difficulty = difficultyConfig[part.difficulty] || difficultyConfig["moderate"];
  const sound = part.sound_level || part.soundLevel;
  const soundStyle = soundConfig[sound] || soundConfig["Stock"];
  const rating = part.rating || 0;
  const hpGain = part.hp_gain ?? part.hpGain ?? 0;
  const torqueGain = part.torque_gain ?? part.torqueGain ?? 0;
  const weightChange = part.weight_change ?? part.weightChange ?? 0;
  const requiresTune = part.requires_tune ?? part.requiresTune ?? false;
  const installTime = part.install_time || part.installTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="group"
    >
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden card-glow transition-all duration-300 group-hover:border-red-500/30 flex flex-col h-full">
        {/* Part Image */}
        <div className="relative h-40 bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
          {(part.image_url || part.image) ? (
            <Image
              src={part.image_url || part.image}
              alt={part.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <Wrench className="h-10 w-10" />
            </div>
          )}
          {/* Brand Badge */}
          {part.brand && (
            <div className="absolute top-3 left-3">
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md border border-white/20">
                {part.brand}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 space-y-4">
          {/* Part Name & Price */}
          <div>
            <h3 className="text-base font-bold text-white leading-tight group-hover:text-red-400 transition-colors">
              {part.name}
            </h3>
            <p className="text-lg font-semibold text-red-500 mt-1">
              {formatPrice(part.price)}
            </p>
          </div>

          {/* Performance Gains */}
          <div className="space-y-2 bg-white/[0.03] rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Performance Gains
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <StatValue value={hpGain} unit="HP" positive="higher" />
              </div>
              <div className="flex items-center gap-1.5">
                <Cog className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <StatValue value={torqueGain} unit="TQ" positive="higher" />
              </div>
              <div className="flex items-center gap-1.5">
                <Weight className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <StatValue value={weightChange} unit="lbs" positive="lower" />
              </div>
              {sound && (
                <div className="flex items-center gap-1.5">
                  <Volume2 className={cn("h-3.5 w-3.5 shrink-0", soundStyle.color)} />
                  <span className={cn("text-sm", soundStyle.color, soundStyle.pulse && "animate-pulse")}>
                    {sound}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border text-[10px]", difficulty.color)}>
              {difficulty.label}
            </Badge>
            {installTime && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Clock className="h-3 w-3" />
                {installTime}
              </Badge>
            )}
            {requiresTune && (
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] gap-1">
                <AlertTriangle className="h-3 w-3" />
                Requires Tune
              </Badge>
            )}
          </div>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3.5 w-3.5",
                    star <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"
                  )}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
            </div>
          )}

          {/* Shop Button */}
          <div className="mt-auto pt-2">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 text-sm">
              <ShoppingCart className="h-4 w-4" />
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
