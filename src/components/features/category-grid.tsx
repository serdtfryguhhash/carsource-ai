"use client";

import { motion } from "framer-motion";
import {
  Cog,
  Wind,
  Zap,
  ArrowDownToLine,
  Cpu,
  ArrowUpDown,
  Circle,
  CircleDot,
  Palette,
  Armchair,
  Thermometer,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "engine", label: "Engine", icon: Cog },
  { id: "exhaust", label: "Exhaust", icon: Wind },
  { id: "turbo", label: "Turbo & Supercharger", icon: Zap },
  { id: "intake", label: "Intake", icon: ArrowDownToLine },
  { id: "ecu", label: "ECU & Tuning", icon: Cpu },
  { id: "suspension", label: "Suspension", icon: ArrowUpDown },
  { id: "wheels", label: "Wheels & Tires", icon: Circle },
  { id: "brakes", label: "Brakes", icon: CircleDot },
  { id: "exterior", label: "Exterior", icon: Palette },
  { id: "interior", label: "Interior", icon: Armchair },
  { id: "cooling", label: "Cooling", icon: Thermometer },
  { id: "drivetrain", label: "Drivetrain", icon: Settings },
];

export default function CategoryGrid({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {categories.map((category, index) => {
        const isSelected = selectedCategory === category.id;
        const Icon = category.icon;

        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
              isSelected
                ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-lg shadow-red-500/5"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/[0.08] hover:border-white/20 hover:text-gray-300"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 transition-colors",
                isSelected ? "text-red-500" : "text-gray-500"
              )}
            />
            <span className="text-xs font-medium text-center leading-tight">
              {category.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
