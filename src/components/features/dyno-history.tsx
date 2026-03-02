'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Gauge, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DynoResult, InstalledMod } from '@/stores';

interface DynoHistoryProps {
  dynoResults: DynoResult[];
  installedMods: InstalledMod[];
  stockHP: number;
  stockTorque: number;
}

export default function DynoHistory({ dynoResults, installedMods, stockHP, stockTorque }: DynoHistoryProps) {
  const chartData = useMemo(() => {
    const basePoint = {
      date: 'Stock',
      hp: stockHP,
      torque: stockTorque,
      label: 'Stock',
    };

    const dynoPoints = dynoResults
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hp: d.hp,
        torque: d.torque,
        label: d.notes || 'Dyno Run',
      }));

    return [basePoint, ...dynoPoints];
  }, [dynoResults, stockHP, stockTorque]);

  const totalModCost = installedMods.reduce((sum, m) => sum + m.cost, 0);
  const totalHPGain = installedMods.reduce((sum, m) => sum + m.hpGain, 0);
  const costPerHP = totalHPGain > 0 ? Math.round(totalModCost / totalHPGain) : 0;

  if (dynoResults.length === 0 && installedMods.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-center">
          <Gauge className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No dyno results yet. Add mods and log dyno runs to track your power progression.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-400">+{totalHPGain}</p>
              <p className="text-xs text-zinc-500">HP Gained</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-yellow-400">${costPerHP}</p>
              <p className="text-xs text-zinc-500">Cost / HP</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Gauge className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-400">{dynoResults.length}</p>
              <p className="text-xs text-zinc-500">Dyno Runs</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-white mb-4">Power Progression</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="hpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="tqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1f2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="hp"
                    name="HP"
                    stroke="#ef4444"
                    fill="url(#hpGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="torque"
                    name="Torque"
                    stroke="#3b82f6"
                    fill="url(#tqGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
