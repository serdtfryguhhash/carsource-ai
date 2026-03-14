"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Zap,
  DollarSign,
  TrendingUp,
  Wrench,
  Target,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Info,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehicles } from "@/data/vehicles";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface AiResult {
  recommendation?: string;
  suggestedMods?: {
    name: string;
    category?: string;
    hp_gain?: number;
    cost?: number;
    difficulty?: string;
    reason?: string;
    priority?: number;
  }[];
  totalEstimatedCost?: number;
  expectedHpAfterMods?: number;
  warnings?: string[];
  tips?: string[];
}

export default function AdvisorPage() {
  const [selectedVehicleSlug, setSelectedVehicleSlug] = useState("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedVehicle = vehicles.find((v) => v.slug === selectedVehicleSlug);

  const handleSubmit = async () => {
    if (!selectedVehicle) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/recommend-mods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle: {
            make: selectedVehicle.make,
            model: selectedVehicle.model,
            year: selectedVehicle.years,
            engine: selectedVehicle.engine_code,
            stock_hp: selectedVehicle.stock_hp,
            stock_torque: selectedVehicle.stock_torque,
          },
          selectedParts: [],
          totalHpGain: 0,
          totalTorqueGain: 0,
          budget: budget ? parseInt(budget, 10) : undefined,
          goals: goals || "More power and better overall performance",
        }),
      });

      if (!res.ok) throw new Error("Failed to get recommendations");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!selectedVehicleSlug && !loading;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 font-medium">AI-Powered</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Mod <span className="gradient-text">Advisor</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Tell us about your car and goals. We&apos;ll recommend the perfect mods
              with a prioritized build path.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 md:p-8 space-y-6">
                {/* Vehicle Select */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Car className="w-4 h-4 inline mr-2 text-red-400" />
                    Your Vehicle
                  </label>
                  <Select value={selectedVehicleSlug} onValueChange={setSelectedVehicleSlug}>
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select your vehicle..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2e] border-white/10">
                      {vehicles.map((v) => (
                        <SelectItem
                          key={v.slug}
                          value={v.slug}
                          className="text-zinc-300 focus:bg-red-500/10 focus:text-white"
                        >
                          {v.make} {v.model} ({v.years}) - {v.engine_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected Vehicle Preview */}
                  <AnimatePresence>
                    {selectedVehicle && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 bg-white/5 rounded-lg p-3 border border-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {selectedVehicle.make} {selectedVehicle.model}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {selectedVehicle.engine_code} &middot; {selectedVehicle.stock_hp} HP
                              &middot; {selectedVehicle.stock_torque} lb-ft
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              selectedVehicle.mod_potential === "Extreme"
                                ? "border-red-500/30 text-red-400"
                                : selectedVehicle.mod_potential === "High"
                                ? "border-orange-500/30 text-orange-400"
                                : "border-yellow-500/30 text-yellow-400"
                            }`}
                          >
                            {selectedVehicle.mod_potential} Potential
                          </Badge>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2 text-yellow-400" />
                    Budget (optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 5000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Target className="w-4 h-4 inline mr-2 text-blue-400" />
                    Goals
                  </label>
                  <Textarea
                    placeholder="What are you looking for? More power? Better handling? Louder exhaust? Daily driver friendly? Track build?"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500 resize-none"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing your build...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {(loading || result || error) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="px-4 pb-24"
          >
            <div className="max-w-4xl mx-auto">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center py-16 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium mb-1">Analyzing your build...</p>
                    <p className="text-sm text-zinc-500">
                      Our AI is researching the best mods for your{" "}
                      {selectedVehicle?.make} {selectedVehicle?.model}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Unable to get recommendations
                    </h3>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <Button
                      onClick={handleSubmit}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Results Display */}
              {result && (
                <div className="space-y-8">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-5 text-center">
                        <Zap className="w-5 h-5 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-400">
                          {result.expectedHpAfterMods || (selectedVehicle?.stock_hp || 0)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Expected HP</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-5 text-center">
                        <DollarSign className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-400">
                          ${(result.totalEstimatedCost || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Est. Total Cost</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-5 text-center">
                        <Wrench className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-400">
                          {result.suggestedMods?.length || 0}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Recommended Mods</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-5 text-center">
                        <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-400">
                          +{(result.expectedHpAfterMods || 0) - (selectedVehicle?.stock_hp || 0)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">HP Gain</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Build Path Recommendation */}
                  {result.recommendation && (
                    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-6">
                          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Build Path Recommendation
                          </h3>
                          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {result.recommendation}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Priority-Ordered Mod List */}
                  {result.suggestedMods && result.suggestedMods.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-400" />
                        Recommended Mods (Priority Order)
                      </h3>
                      <div className="space-y-3">
                        {result.suggestedMods.map((mod, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-sm font-bold text-red-400">
                                        {i + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">{mod.name}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-1">
                                        {mod.category && (
                                          <Badge
                                            variant="outline"
                                            className="border-white/10 text-zinc-400 text-xs"
                                          >
                                            {mod.category}
                                          </Badge>
                                        )}
                                        {mod.difficulty && (
                                          <Badge
                                            variant="outline"
                                            className="border-white/10 text-zinc-400 text-xs"
                                          >
                                            {mod.difficulty}
                                          </Badge>
                                        )}
                                      </div>
                                      {mod.reason && (
                                        <p className="text-sm text-zinc-500 mt-2">
                                          {mod.reason}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    {mod.hp_gain !== undefined && (
                                      <p className="text-green-400 font-bold">
                                        +{mod.hp_gain} HP
                                      </p>
                                    )}
                                    {mod.cost !== undefined && (
                                      <p className="text-sm text-yellow-400">
                                        ${mod.cost.toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {result.warnings && result.warnings.length > 0 && (
                    <Card className="bg-yellow-500/5 border-yellow-500/20">
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Warnings
                        </h3>
                        <ul className="space-y-2">
                          {result.warnings.map((w, i) => (
                            <li
                              key={i}
                              className="text-sm text-zinc-300 flex items-start gap-2"
                            >
                              <span className="text-yellow-500 mt-1 flex-shrink-0">&bull;</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tips */}
                  {result.tips && result.tips.length > 0 && (
                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardContent className="p-6">
                        <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Pro Tips
                        </h3>
                        <ul className="space-y-2">
                          {result.tips.map((t, i) => (
                            <li
                              key={i}
                              className="text-sm text-zinc-300 flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* CTA to Build Page */}
                  {selectedVehicle && (
                    <div className="text-center pt-4">
                      <Link href={`/build/${selectedVehicle.slug}`}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-6 text-lg rounded-xl">
                          Start Building Your {selectedVehicle.make} {selectedVehicle.model}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Empty State - No Results Yet */}
      {!loading && !result && !error && (
        <section className="px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Power Builds",
                  desc: "Maximize HP and torque with the right combination of mods",
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                },
                {
                  icon: Car,
                  title: "Handling Builds",
                  desc: "Suspension, brakes, and tires for the best track performance",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: Wrench,
                  title: "Full Builds",
                  desc: "Complete build paths from bolt-ons to full race setups",
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
              ].map((item) => (
                <Card key={item.title} className="bg-white/5 border-white/10">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
