"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Cog,
  Weight,
  DollarSign,
  X,
  Bot,
  Share2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

function GainBar({
  label,
  gain,
  maxGain,
  icon: Icon,
  iconColor,
}: {
  label: string;
  gain: number;
  maxGain: number;
  icon: any;
  iconColor: string;
}) {
  const percentage = Math.min(Math.abs(gain) / maxGain, 1) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
          {label}
        </div>
        <span className={gain > 0 ? "stat-positive font-medium" : gain < 0 ? "stat-negative font-medium" : "stat-neutral"}>
          {gain > 0 ? "+" : ""}
          {gain}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full hp-bar"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BuildSummary({
  vehicle,
  selectedParts,
  onRemovePart,
  onGetAdvice,
  onShareBuild,
}: {
  vehicle: any;
  selectedParts: any[];
  onRemovePart?: (partId: string) => void;
  onGetAdvice?: () => void;
  onShareBuild?: () => void;
}) {
  const stockHp = vehicle?.stock_hp ?? vehicle?.stockHp ?? 0;
  const stockTorque = vehicle?.stock_torque ?? vehicle?.stockTorque ?? 0;
  const stockWeight = vehicle?.weight ?? vehicle?.curb_weight ?? 0;

  const totalHpGain = selectedParts.reduce(
    (sum, p) => sum + (p.hp_gain ?? p.hpGain ?? 0),
    0
  );
  const totalTorqueGain = selectedParts.reduce(
    (sum, p) => sum + (p.torque_gain ?? p.torqueGain ?? 0),
    0
  );
  const totalWeightChange = selectedParts.reduce(
    (sum, p) => sum + (p.weight_change ?? p.weightChange ?? 0),
    0
  );
  const totalCost = selectedParts.reduce(
    (sum, p) => sum + (p.price ?? 0),
    0
  );

  const modifiedHp = stockHp + totalHpGain;
  const modifiedTorque = stockTorque + totalTorqueGain;
  const modifiedWeight = stockWeight + totalWeightChange;

  return (
    <div className="sticky top-20 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-white/[0.02]">
        <h2 className="text-base font-bold text-white">Build Summary</h2>
        {vehicle && (
          <p className="text-sm text-gray-500 mt-0.5">
            {vehicle.make} {vehicle.model}
            {vehicle.generation ? ` ${vehicle.generation}` : ""}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="p-5 space-y-5">
        {/* HP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Horsepower</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 line-through">{stockHp}</span>
                <ChevronRight className="h-3 w-3 text-gray-600" />
                <span className="text-lg font-bold text-white">
                  <AnimatedNumber value={modifiedHp} />
                </span>
              </div>
            </div>
          </div>
          {totalHpGain > 0 && (
            <span className="text-sm font-semibold stat-positive">+{totalHpGain}</span>
          )}
        </div>

        {/* Torque */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Cog className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Torque</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 line-through">{stockTorque}</span>
                <ChevronRight className="h-3 w-3 text-gray-600" />
                <span className="text-lg font-bold text-white">
                  <AnimatedNumber value={modifiedTorque} />
                </span>
              </div>
            </div>
          </div>
          {totalTorqueGain > 0 && (
            <span className="text-sm font-semibold stat-positive">+{totalTorqueGain}</span>
          )}
        </div>

        {/* Weight */}
        {stockWeight > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Weight className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">Weight</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 line-through">{stockWeight.toLocaleString()}</span>
                  <ChevronRight className="h-3 w-3 text-gray-600" />
                  <span className="text-lg font-bold text-white">
                    <AnimatedNumber value={modifiedWeight} />
                  </span>
                  <span className="text-xs text-gray-500">lbs</span>
                </div>
              </div>
            </div>
            {totalWeightChange !== 0 && (
              <span className={cn("text-sm font-semibold", totalWeightChange < 0 ? "stat-positive" : "stat-negative")}>
                {totalWeightChange > 0 ? "+" : ""}
                {totalWeightChange}
              </span>
            )}
          </div>
        )}

        {/* Total Cost */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Cost</p>
              <span className="text-lg font-bold text-white">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Gain Bars */}
        {selectedParts.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-white/5">
            <GainBar label="HP Gain" gain={totalHpGain} maxGain={200} icon={Zap} iconColor="text-red-500" />
            <GainBar label="TQ Gain" gain={totalTorqueGain} maxGain={200} icon={Cog} iconColor="text-orange-500" />
          </div>
        )}

        {/* Selected Parts List */}
        {selectedParts.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Selected Parts ({selectedParts.length})
            </p>
            <AnimatePresence mode="popLayout">
              {selectedParts.map((part) => (
                <motion.div
                  key={part.id || part.name}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-300 truncate">{part.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {part.hp_gain ?? part.hpGain ? `+${part.hp_gain ?? part.hpGain} HP` : ""}
                      {(part.hp_gain ?? part.hpGain) && (part.torque_gain ?? part.torqueGain) ? " / " : ""}
                      {part.torque_gain ?? part.torqueGain ? `+${part.torque_gain ?? part.torqueGain} TQ` : ""}
                    </p>
                  </div>
                  {onRemovePart && (
                    <button
                      onClick={() => onRemovePart(part.id || part.name)}
                      className="ml-2 p-1 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {selectedParts.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-600">No parts selected yet.</p>
            <p className="text-xs text-gray-600 mt-1">Browse categories and add parts to your build.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-5 border-t border-white/10 space-y-2">
        <Button
          onClick={onGetAdvice}
          className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          <Bot className="h-4 w-4" />
          Get AI Build Advice
        </Button>
        <Button
          onClick={onShareBuild}
          variant="outline"
          className="w-full border-white/10 text-gray-400 hover:text-white gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Build
        </Button>
      </div>
    </div>
  );
}
