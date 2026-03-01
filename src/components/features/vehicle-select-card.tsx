"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, Weight, Cog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  JDM: "bg-red-500/20 text-red-400 border-red-500/30",
  Muscle: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  European: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Truck: "bg-green-500/20 text-green-400 border-green-500/30",
  Korean: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  Exotic: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const modPotentialColors = ["bg-gray-600", "bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];

export default function VehicleSelectCard({ vehicle, index = 0 }: { vehicle: any; index?: number }) {
  const slug = vehicle.slug || `${vehicle.make}-${vehicle.model}`.toLowerCase().replace(/\s+/g, "-");
  const catColor = categoryColors[vehicle.category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const modPotential = vehicle.mod_potential || vehicle.modPotential || 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link href={`/build/${slug}`} className="block group">
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden card-glow transition-all duration-300 group-hover:scale-[1.02] group-hover:border-red-500/40">
          {/* Vehicle Image */}
          <div className="relative h-48 bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
            {vehicle.image ? (
              <Image
                src={vehicle.image}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                <Cog className="h-12 w-12" />
              </div>
            )}
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={cn("border text-xs font-medium", catColor)}>
                {vehicle.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-500">
                {vehicle.generation && `${vehicle.generation} `}
                {vehicle.years || vehicle.year_range || ""}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                <Zap className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-medium text-gray-300">
                  {vehicle.stock_hp || vehicle.stockHp || "---"} HP
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                <Cog className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-medium text-gray-300">
                  {vehicle.stock_torque || vehicle.stockTorque || "---"} TQ
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                <Weight className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-medium text-gray-300">
                  {vehicle.drivetrain || "---"}
                </span>
              </div>
            </div>

            {/* Mod Potential */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Mod Potential</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      level <= modPotential
                        ? modPotentialColors[modPotential - 1] || "bg-green-500"
                        : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
