"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Car, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { vehicles, getVehiclesByCategory } from "@/data/vehicles";
import VehicleSelectCard from "@/components/features/vehicle-select-card";
import type { VehicleCategory, Vehicle } from "@/types";

const categories: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "JDM", value: "JDM" },
  { label: "Muscle", value: "Muscle" },
  { label: "European", value: "European" },
  { label: "Truck", value: "Truck" },
  { label: "SUV", value: "SUV" },
  { label: "Sports", value: "Sports" },
];

type SortOption = "alpha" | "hp" | "potential";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "A-Z", value: "alpha" },
  { label: "Highest HP", value: "hp" },
  { label: "Mod Potential", value: "potential" },
];

const potentialRank: Record<string, number> = {
  Extreme: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function GaragePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("alpha");
  const [showSort, setShowSort] = useState(false);

  const filteredVehicles = useMemo(() => {
    let result: Vehicle[] = [...vehicles];

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((v) => v.category === selectedCategory);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          `${v.make} ${v.model}`.toLowerCase().includes(q) ||
          v.engine_code.toLowerCase().includes(q) ||
          v.years.includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "alpha":
        result.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
        break;
      case "hp":
        result.sort((a, b) => b.stock_hp - a.stock_hp);
        break;
      case "potential":
        result.sort((a, b) => (potentialRank[b.mod_potential] || 0) - (potentialRank[a.mod_potential] || 0));
        break;
    }

    return result;
  }, [search, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-red-500" />
              </div>
              <Badge variant="outline" className="border-red-500/30 text-red-400">
                Garage
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">
              Select Your Vehicle
            </h1>
            <p className="text-zinc-400 text-lg mt-2 max-w-xl">
              Choose your car to see all available modifications and build your dream setup.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-4 pb-8 sticky top-0 z-30 bg-[#0d1117]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search by make, model, engine code, or year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:border-red-500/50 focus:ring-red-500/20"
              />
            </div>

            {/* Category Filters + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={
                      selectedCategory === cat.value
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                        : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/20"
                    }
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              {/* Sort Toggle */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSort(!showSort)}
                  className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort: {sortOptions.find((s) => s.value === sortBy)?.label}
                </Button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl z-40 overflow-hidden min-w-[160px]">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt.value
                            ? "bg-red-500/10 text-red-400"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vehicle Count */}
      <section className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-zinc-500">
            Showing{" "}
            <span className="text-white font-medium">{filteredVehicles.length}</span>{" "}
            vehicle{filteredVehicles.length !== 1 ? "s" : ""}
            {selectedCategory !== "All" && (
              <span className="text-zinc-600">
                {" "}
                in <span className="text-red-400">{selectedCategory}</span>
              </span>
            )}
            {search && (
              <span className="text-zinc-600">
                {" "}
                matching &ldquo;<span className="text-zinc-300">{search}</span>&rdquo;
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {filteredVehicles.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${sortBy}-${search}`}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredVehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.3 }}
                >
                  <VehicleSelectCard vehicle={vehicle} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No vehicles found</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Try adjusting your search or category filters to find your ride.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-white/10 text-zinc-400 hover:text-white"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
