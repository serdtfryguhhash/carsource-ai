import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Zap,
  Gauge,
  Weight,
  Volume2,
  Fuel,
  Wrench,
  Clock,
  Settings,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { modParts, getPartBySlug, getPartsByCategory } from "@/data/parts";
import { getVehicleBySlug } from "@/data/vehicles";
import type { ModPart } from "@/types";

export function generateStaticParams() {
  return modParts.map((part) => ({
    slug: part.slug,
  }));
}

function SoundLevelIndicator({ level }: { level: ModPart["sound_level"] }) {
  const levels = ["Stock", "Mild", "Moderate", "Loud", "Very Loud", "Race"];
  const idx = levels.indexOf(level);
  const bars = 6;

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`h-4 w-1.5 rounded-full transition-colors ${
            i <= idx
              ? i <= 1
                ? "bg-green-500"
                : i <= 3
                ? "bg-yellow-500"
                : "bg-red-500"
              : "bg-white/10"
          }`}
          style={{ height: `${10 + i * 3}px` }}
        />
      ))}
      <span className="text-sm text-zinc-400 ml-2">{level}</span>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: ModPart["difficulty"] }) {
  const colorMap: Record<string, string> = {
    "Bolt-On": "border-green-500/30 text-green-400 bg-green-500/10",
    Moderate: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
    Advanced: "border-orange-500/30 text-orange-400 bg-orange-500/10",
    "Professional Only": "border-red-500/30 text-red-400 bg-red-500/10",
  };

  return (
    <Badge variant="outline" className={`${colorMap[difficulty] || ""} text-sm px-3 py-1`}>
      {difficulty}
    </Badge>
  );
}

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const part = getPartBySlug(slug);

  if (!part) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-zinc-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Part Not Found</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            We couldn&apos;t find a part matching &ldquo;{slug}&rdquo;.
          </p>
          <Link href="/garage">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Garage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get related parts (same category, different brand)
  let relatedParts: ModPart[] = [];
  try {
    relatedParts = getPartsByCategory(part.category)
      .filter((p) => p.id !== part.id && p.brand !== part.brand)
      .slice(0, 4);
  } catch {
    relatedParts = modParts
      .filter((p) => p.category === part.category && p.id !== part.id && p.brand !== part.brand)
      .slice(0, 4);
  }

  // Get compatible vehicle details
  const compatibleVehicles = part.compatible_vehicles
    .map((vSlug) => {
      try {
        return getVehicleBySlug(vSlug);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Link
          href="/garage"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Garage
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT - Image & Performance */}
          <div className="lg:w-1/2">
            {/* Part Image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 relative mb-8">
              <Image
                src={part.image_url}
                alt={part.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Performance Stats - Prominent Display */}
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Performance Impact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* HP Gain */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                    <Zap className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-green-400">
                      +{part.hp_gain}
                    </p>
                    <p className="text-xs text-green-400/70 mt-1">Horsepower</p>
                  </div>

                  {/* Torque Gain */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center">
                    <Gauge className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-400">
                      +{part.torque_gain}
                    </p>
                    <p className="text-xs text-blue-400/70 mt-1">lb-ft Torque</p>
                  </div>

                  {/* Weight Change */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                    <Weight className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                    <p className={`text-3xl font-bold ${part.weight_change < 0 ? "text-green-400" : part.weight_change > 0 ? "text-yellow-400" : "text-zinc-400"}`}>
                      {part.weight_change > 0 ? "+" : ""}{part.weight_change}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">lbs</p>
                  </div>

                  {/* Sound Level */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <Volume2 className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                    <div className="flex justify-center">
                      <SoundLevelIndicator level={part.sound_level} />
                    </div>
                  </div>
                </div>

                {/* Fuel Economy */}
                {part.fuel_economy_impact && (
                  <div className="mt-4 flex items-center gap-2 bg-white/5 rounded-lg p-3">
                    <Fuel className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">Fuel Economy:</span>
                    <span className="text-sm text-zinc-300">{part.fuel_economy_impact}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - Details */}
          <div className="lg:w-1/2">
            {/* Brand & Category */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="border-red-500/30 text-red-400">
                {part.category}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-zinc-400">
                {part.subcategory}
              </Badge>
            </div>

            {/* Brand */}
            <p className="text-red-400 font-medium text-sm mb-1">{part.brand}</p>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{part.name}</h1>

            {/* Part Number */}
            <p className="text-sm text-zinc-500 mb-4">Part # {part.part_number}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(part.rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-400">
                {part.rating} ({part.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <p className="text-4xl font-bold text-white">
                ${part.price.toLocaleString()}
              </p>
            </div>

            {/* Buy Button */}
            <div className="flex gap-3 mb-8">
              <a href={part.buy_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg rounded-xl">
                  Buy Now <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Description
              </h3>
              <p className="text-zinc-300 leading-relaxed">{part.description}</p>
            </div>

            {/* Features */}
            {part.features && part.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Features
                </h3>
                <ul className="space-y-2">
                  {part.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Install Info */}
            <Card className="bg-white/5 border-white/10 mb-8">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Installation Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm text-zinc-400">Difficulty</span>
                    </div>
                    <DifficultyBadge difficulty={part.difficulty} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm text-zinc-400">Install Time</span>
                    </div>
                    <span className="text-sm text-white font-medium">{part.install_time}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm text-zinc-400">Requires Tune</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        part.requires_tune
                          ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                          : "border-green-500/30 text-green-400 bg-green-500/10"
                      }
                    >
                      {part.requires_tune ? "Yes" : "No"}
                    </Badge>
                  </div>

                  {/* Additional Parts Needed */}
                  {part.additional_parts_needed && part.additional_parts_needed.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-400">Additional Parts Needed</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-6">
                        {part.additional_parts_needed.map((ap, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="border-white/10 text-zinc-300 text-xs"
                          >
                            {ap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warranty Impact */}
                  {part.warranty_impact && (
                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-yellow-400 mb-0.5">
                            Warranty Impact
                          </p>
                          <p className="text-xs text-zinc-400">{part.warranty_impact}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compatible Vehicles */}
            {compatibleVehicles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Compatible Vehicles
                </h3>
                <div className="space-y-2">
                  {compatibleVehicles.map((v: any) =>
                    v ? (
                      <Link
                        key={v.slug}
                        href={`/build/${v.slug}`}
                        className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg p-3 hover:bg-white/[0.08] hover:border-red-500/20 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 relative flex-shrink-0">
                            <Image
                              src={v.image_url}
                              alt={`${v.make} ${v.model}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {v.make} {v.model}
                            </p>
                            <p className="text-xs text-zinc-500">{v.years}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-400 transition-colors" />
                      </Link>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Parts */}
        {relatedParts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Related Parts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedParts.map((rp) => (
                <Link key={rp.id} href={`/part/${rp.slug}`}>
                  <Card className="bg-white/5 border-white/10 hover:border-red-500/30 transition-all card-glow overflow-hidden h-full">
                    <div className="aspect-video relative bg-white/5">
                      <Image
                        src={rp.image_url}
                        alt={rp.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-red-400 font-medium mb-1">{rp.brand}</p>
                      <p className="text-sm font-semibold text-white mb-2 line-clamp-2">{rp.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">
                          ${rp.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-green-400 font-medium">
                          +{rp.hp_gain} HP
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
