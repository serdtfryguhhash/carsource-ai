"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Zap,
  Gauge,
  Weight,
  Settings2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertTriangle,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getVehicleBySlug } from "@/data/vehicles";
import { modParts, getPartsForVehicle } from "@/data/parts";
import PartCard from "@/components/features/part-card";
import CategoryGrid from "@/components/features/category-grid";
import type { ModPart, ModCategory } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const allCategories: ModCategory[] = [
  "Engine",
  "Exhaust",
  "Turbo & Supercharger",
  "Intake",
  "Suspension",
  "Wheels & Tires",
  "Brakes",
  "Exterior",
  "Interior",
  "Lighting",
  "Audio",
  "ECU & Tuning",
  "Drivetrain",
  "Cooling",
  "Fuel System",
];

export default function BuildPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const vehicle = getVehicleBySlug(slug);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Get compatible parts
  const allParts = useMemo(() => {
    try {
      return getPartsForVehicle(slug);
    } catch {
      return modParts.filter((p) => p.compatible_vehicles.includes(slug));
    }
  }, [slug]);

  // Get unique categories that have parts
  const availableCategories = useMemo(() => {
    const cats = new Set(allParts.map((p) => p.category));
    return ["All", ...allCategories.filter((c) => cats.has(c))];
  }, [allParts]);

  // Filter by category and search
  const filteredParts = useMemo(() => {
    let parts = allParts;
    if (selectedCategory !== "All") {
      parts = parts.filter((p) => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      parts = parts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return parts;
  }, [allParts, selectedCategory, search]);

  // Calculate build stats
  const selectedParts = useMemo(
    () => modParts.filter((p) => selectedPartIds.includes(p.id)),
    [selectedPartIds]
  );
  const totalHpGain = selectedParts.reduce((sum, p) => sum + p.hp_gain, 0);
  const totalTorqueGain = selectedParts.reduce((sum, p) => sum + p.torque_gain, 0);
  const totalWeightChange = selectedParts.reduce((sum, p) => sum + p.weight_change, 0);
  const totalCost = selectedParts.reduce((sum, p) => sum + p.price, 0);

  const togglePart = useCallback((partId: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  }, []);

  const removePart = useCallback((partId: string) => {
    setSelectedPartIds((prev) => prev.filter((id) => id !== partId));
  }, []);

  // AI Recommendation
  const fetchAiRecommendation = async () => {
    if (!vehicle) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setAiModalOpen(true);

    try {
      const res = await fetch("/api/recommend-mods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle: {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.years,
            engine: vehicle.engine_code,
            stock_hp: vehicle.stock_hp,
            stock_torque: vehicle.stock_torque,
          },
          selectedParts: selectedParts.map((p) => ({
            name: p.name,
            brand: p.brand,
            category: p.category,
            hp_gain: p.hp_gain,
            torque_gain: p.torque_gain,
          })),
          totalHpGain,
          totalTorqueGain,
          budget: 5000,
          goals: "More power and better performance",
        }),
      });

      if (!res.ok) throw new Error("Failed to get AI recommendation");
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Failed to get AI recommendation. Try again later."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Vehicle not found
  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Car className="w-12 h-12 text-zinc-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Vehicle Not Found</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            We couldn&apos;t find a vehicle matching &ldquo;{slug}&rdquo;. It may have been
            removed or the URL is incorrect.
          </p>
          <Link href="/garage">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Garage
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const estimatedHp = vehicle.stock_hp + totalHpGain;
  const estimatedTorque = vehicle.stock_torque + totalTorqueGain;
  const estimatedWeight = vehicle.stock_weight + totalWeightChange;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Vehicle Header */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              href="/garage"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-red-400 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Garage
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Vehicle Image */}
              <div className="w-full md:w-80 aspect-video rounded-2xl overflow-hidden bg-white/5 relative flex-shrink-0">
                <Image
                  src={vehicle.image_url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Vehicle Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                    {vehicle.category}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                    {vehicle.years}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      vehicle.mod_potential === "Extreme"
                        ? "border-red-500/30 text-red-400"
                        : vehicle.mod_potential === "High"
                        ? "border-orange-500/30 text-orange-400"
                        : "border-yellow-500/30 text-yellow-400"
                    }`}
                  >
                    {vehicle.mod_potential} Mod Potential
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-zinc-500 text-sm mb-6">
                  {vehicle.generation} &middot; {vehicle.engine_code} &middot;{" "}
                  {vehicle.transmission}
                </p>

                {/* Stock Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      Stock HP
                    </div>
                    <p className="text-2xl font-bold text-white">{vehicle.stock_hp}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Gauge className="w-3.5 h-3.5" />
                      Stock TQ
                    </div>
                    <p className="text-2xl font-bold text-white">{vehicle.stock_torque}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Weight className="w-3.5 h-3.5" />
                      Weight
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {vehicle.stock_weight.toLocaleString()}
                      <span className="text-sm text-zinc-500 ml-1">lbs</span>
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Settings2 className="w-3.5 h-3.5" />
                      Drivetrain
                    </div>
                    <p className="text-2xl font-bold text-white">{vehicle.drivetrain}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN - Parts Browser */}
          <div className="flex-1 min-w-0">
            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <CategoryGrid
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Search parts by name or brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-lg focus:border-red-500/50"
                />
              </div>
            </motion.div>

            {/* Parts Count */}
            <div className="mb-4">
              <p className="text-sm text-zinc-500">
                <span className="text-white font-medium">{filteredParts.length}</span> part
                {filteredParts.length !== 1 ? "s" : ""} available
                {selectedCategory !== "All" && (
                  <>
                    {" "}
                    in <span className="text-red-400">{selectedCategory}</span>
                  </>
                )}
              </p>
            </div>

            {/* Parts Grid */}
            {filteredParts.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${search}`}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {filteredParts.map((part) => (
                  <motion.div
                    key={part.id}
                    variants={fadeInUp}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      onClick={() => togglePart(part.id)}
                      className={`cursor-pointer relative rounded-xl transition-all duration-200 ${
                        selectedPartIds.includes(part.id)
                          ? "ring-2 ring-red-500 ring-offset-2 ring-offset-[#0d1117]"
                          : ""
                      }`}
                    >
                      {selectedPartIds.includes(part.id) && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <CheckCircle2 className="w-6 h-6 text-red-500 fill-red-500" />
                        </div>
                      )}
                      <PartCard part={part} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No parts found</h3>
                <p className="text-zinc-500 text-sm">
                  Try a different category or search term.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Build Summary (Desktop) */}
          <div className="hidden lg:block w-96 flex-shrink-0">
            <div className="sticky top-24">
              <BuildSummarySidebar
                vehicle={vehicle}
                selectedParts={selectedParts}
                totalHpGain={totalHpGain}
                totalTorqueGain={totalTorqueGain}
                totalWeightChange={totalWeightChange}
                totalCost={totalCost}
                estimatedHp={estimatedHp}
                estimatedTorque={estimatedTorque}
                estimatedWeight={estimatedWeight}
                onRemovePart={removePart}
                onGetAiAdvice={fetchAiRecommendation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#0d1117] border-t border-white/10 max-h-[70vh] overflow-y-auto p-4"
            >
              <BuildSummarySidebar
                vehicle={vehicle}
                selectedParts={selectedParts}
                totalHpGain={totalHpGain}
                totalTorqueGain={totalTorqueGain}
                totalWeightChange={totalWeightChange}
                totalCost={totalCost}
                estimatedHp={estimatedHp}
                estimatedTorque={estimatedTorque}
                estimatedWeight={estimatedWeight}
                onRemovePart={removePart}
                onGetAiAdvice={fetchAiRecommendation}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="bg-[#151b26] border-t border-white/10 p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  +{totalHpGain} HP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  ${totalCost.toLocaleString()}
                </span>
              </div>
              <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                {selectedParts.length} part{selectedParts.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            {mobileDrawerOpen ? (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="bg-[#0d1117] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-400" />
              AI Build Advisor
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Personalized mod recommendations for your {vehicle.make} {vehicle.model}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {aiLoading && (
              <div className="flex flex-col items-center py-12 gap-4">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                <p className="text-zinc-400">
                  Analyzing your {vehicle.make} {vehicle.model} build...
                </p>
              </div>
            )}

            {aiError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-300 font-medium mb-1">Unable to get recommendation</p>
                <p className="text-zinc-400 text-sm">{aiError}</p>
                <Button
                  onClick={fetchAiRecommendation}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            )}

            {aiResult && (
              <div className="space-y-6">
                {/* Recommendation Text */}
                {aiResult.recommendation && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Build Path</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {aiResult.recommendation}
                    </p>
                  </div>
                )}

                {/* Suggested Mods */}
                {aiResult.suggestedMods && aiResult.suggestedMods.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Recommended Next Mods
                    </h3>
                    <div className="space-y-2">
                      {aiResult.suggestedMods.map((mod: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white/5 rounded-lg p-4 border border-white/5 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">{mod.name}</p>
                            <p className="text-zinc-500 text-xs">{mod.reason}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            {mod.hp_gain && (
                              <span className="text-green-400 font-medium">
                                +{mod.hp_gain} HP
                              </span>
                            )}
                            {mod.cost && (
                              <span className="text-yellow-400">
                                ${mod.cost}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {aiResult.warnings && aiResult.warnings.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Warnings
                    </h3>
                    <ul className="space-y-1">
                      {aiResult.warnings.map((w: string, i: number) => (
                        <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">&bull;</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tips */}
                {aiResult.tips && aiResult.tips.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">Pro Tips</h3>
                    <ul className="space-y-1">
                      {aiResult.tips.map((t: string, i: number) => (
                        <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-1">&bull;</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Build Summary Sidebar Component ─── */

interface BuildSummarySidebarProps {
  vehicle: any;
  selectedParts: ModPart[];
  totalHpGain: number;
  totalTorqueGain: number;
  totalWeightChange: number;
  totalCost: number;
  estimatedHp: number;
  estimatedTorque: number;
  estimatedWeight: number;
  onRemovePart: (id: string) => void;
  onGetAiAdvice: () => void;
}

function BuildSummarySidebar({
  vehicle,
  selectedParts,
  totalHpGain,
  totalTorqueGain,
  totalWeightChange,
  totalCost,
  estimatedHp,
  estimatedTorque,
  estimatedWeight,
  onRemovePart,
  onGetAiAdvice,
}: BuildSummarySidebarProps) {
  const maxHpGainVisual = 200; // for progress bar scaling
  const maxTqGainVisual = 200;

  return (
    <Card className="bg-white/5 border-white/10 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-400" />
          Build Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modified Stats */}
        <div className="space-y-4">
          {/* HP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Horsepower</span>
              <span className="text-xs text-zinc-500">
                {vehicle.stock_hp} + {totalHpGain} ={" "}
                <span className="text-white font-bold">{estimatedHp} HP</span>
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${Math.min(
                    100,
                    ((vehicle.stock_hp + totalHpGain) / (vehicle.stock_hp + maxHpGainVisual)) * 100
                  )}%`,
                }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
            {totalHpGain > 0 && (
              <p className="text-xs text-green-400 mt-1 font-medium">+{totalHpGain} HP gain</p>
            )}
          </div>

          {/* Torque */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Torque</span>
              <span className="text-xs text-zinc-500">
                {vehicle.stock_torque} + {totalTorqueGain} ={" "}
                <span className="text-white font-bold">{estimatedTorque} lb-ft</span>
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${Math.min(
                    100,
                    ((vehicle.stock_torque + totalTorqueGain) /
                      (vehicle.stock_torque + maxTqGainVisual)) *
                      100
                  )}%`,
                }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
            {totalTorqueGain > 0 && (
              <p className="text-xs text-blue-400 mt-1 font-medium">
                +{totalTorqueGain} lb-ft gain
              </p>
            )}
          </div>

          {/* Weight */}
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Weight</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">
                {estimatedWeight.toLocaleString()} lbs
              </p>
              {totalWeightChange !== 0 && (
                <p
                  className={`text-xs font-medium ${
                    totalWeightChange < 0 ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {totalWeightChange > 0 ? "+" : ""}
                  {totalWeightChange} lbs
                </p>
              )}
            </div>
          </div>

          {/* Total Cost */}
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-zinc-400">Total Cost</span>
            </div>
            <p className="text-sm font-bold text-white">${totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Selected Parts List */}
        {selectedParts.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Selected Parts ({selectedParts.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {selectedParts.map((part) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-3 group"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm text-white font-medium truncate">{part.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-green-400">+{part.hp_gain} HP</span>
                      <span className="text-xs text-zinc-600">&middot;</span>
                      <span className="text-xs text-zinc-400">${part.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemovePart(part.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-zinc-500 text-sm">
              Click parts to add them to your build
            </p>
          </div>
        )}

        {/* AI Advice Button */}
        <Button
          onClick={onGetAiAdvice}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get AI Build Advice
        </Button>
      </CardContent>
    </Card>
  );
}
