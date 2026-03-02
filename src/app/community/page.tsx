'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, ThumbsUp, Trophy, Star, Zap, DollarSign, Wrench,
  Share2, ChevronRight, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore, type CommunityBuild } from '@/stores';
import ShareCard from '@/components/shared/ShareCard';
import { XP_ACTIONS } from '@/lib/gamification';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const VISITOR_ID = 'visitor-' + Math.random().toString(36).substring(2, 9);

export default function CommunityPage() {
  const communityBuilds = useAppStore((s) => s.communityBuilds);
  const userVehicles = useAppStore((s) => s.vehicles);
  const addCommunityBuild = useAppStore((s) => s.addCommunityBuild);
  const upvoteBuild = useAppStore((s) => s.upvoteBuild);
  const addXP = useAppStore((s) => s.addXP);
  const checkAchievements = useAppStore((s) => s.checkAchievements);

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showBuildDetail, setShowBuildDetail] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<CommunityBuild | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [buildDesc, setBuildDesc] = useState('');

  const featuredBuilds = useMemo(
    () => communityBuilds.filter((b) => b.featured || b.upvotes >= 5).slice(0, 3),
    [communityBuilds]
  );

  const sortedBuilds = useMemo(
    () => [...communityBuilds].sort((a, b) => b.upvotes - a.upvotes),
    [communityBuilds]
  );

  const handleShareBuild = () => {
    if (!selectedVehicleId) return;
    const vehicle = userVehicles.find((v) => v.id === selectedVehicleId);
    if (!vehicle) return;

    const build: CommunityBuild = {
      id: `cb-${Date.now()}`,
      vehicleId: vehicle.id,
      userId: VISITOR_ID,
      userName: 'You',
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicleSlug: vehicle.vehicleSlug,
      imageUrl: vehicle.imageUrl,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      engineCode: vehicle.engineCode,
      stockHP: vehicle.currentHP - vehicle.installedMods.reduce((s, m) => s + m.hpGain, 0),
      currentHP: vehicle.currentHP,
      totalInvested: vehicle.installedMods.reduce((s, m) => s + m.cost, 0),
      modList: vehicle.installedMods.map((m) => m.partName),
      upvotes: 0,
      upvotedBy: [],
      dateShared: new Date().toISOString(),
      featured: false,
      description: buildDesc,
    };

    addCommunityBuild(build);
    addXP(XP_ACTIONS.SHARE_COMMUNITY.amount, 'SHARE_COMMUNITY');
    checkAchievements();
    setSelectedVehicleId('');
    setBuildDesc('');
    setShowShareDialog(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">Community</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Community Builds</h1>
            <p className="text-zinc-400 text-lg mt-2 max-w-xl">
              Share your build, discover others, and get inspired.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Share CTA */}
      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => setShowShareDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={userVehicles.length === 0}>
            <Share2 className="w-4 h-4 mr-2" /> Share Your Build
          </Button>
          {userVehicles.length === 0 && (
            <p className="text-xs text-zinc-500 mt-2">Add a vehicle to your garage first to share a build.</p>
          )}
        </div>
      </section>

      {/* Featured Builds */}
      {featuredBuilds.length > 0 && (
        <section className="px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">Build of the Week</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredBuilds.map((build) => (
                <Card key={build.id} className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer"
                  onClick={() => { setSelectedBuild(build); setShowBuildDetail(true); }}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                        <Trophy className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                      <span className="text-xs text-zinc-500">{build.upvotes} upvotes</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{build.vehicleName}</h3>
                    <div className="flex gap-3">
                      <span className="text-sm text-green-400 font-medium">{build.currentHP} HP</span>
                      <span className="text-sm text-yellow-400">${build.totalInvested.toLocaleString()}</span>
                      <span className="text-sm text-zinc-400">{build.modList.length} mods</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Builds */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {sortedBuilds.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No community builds yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">Be the first to share your build with the community!</p>
            </motion.div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBuilds.map((build) => (
                <motion.div key={build.id} variants={fadeInUp} transition={{ duration: 0.3 }}>
                  <Card
                    className="bg-white/5 border-white/10 hover:border-blue-500/40 transition-all cursor-pointer card-glow"
                    onClick={() => { setSelectedBuild(build); setShowBuildDetail(true); }}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{build.vehicleName}</h3>
                          <p className="text-sm text-zinc-500">by {build.userName}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); upvoteBuild(build.id, VISITOR_ID); }}
                          className={`gap-1 ${build.upvotedBy.includes(VISITOR_ID) ? 'text-blue-400' : 'text-zinc-500 hover:text-blue-400'}`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {build.upvotes}
                        </Button>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                          <Zap className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-xs font-medium text-gray-300">{build.currentHP} HP</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                          <DollarSign className="h-3.5 w-3.5 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-300">${build.totalInvested.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                          <Wrench className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-xs font-medium text-gray-300">{build.modList.length} mods</span>
                        </div>
                      </div>

                      {build.description && (
                        <p className="text-sm text-zinc-400 line-clamp-2">{build.description}</p>
                      )}

                      {build.modList.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {build.modList.slice(0, 3).map((mod, i) => (
                            <Badge key={i} variant="outline" className="border-white/10 text-zinc-400 text-xs">
                              {mod}
                            </Badge>
                          ))}
                          {build.modList.length > 3 && (
                            <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs">
                              +{build.modList.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Share Your Build</DialogTitle>
            <DialogDescription className="text-zinc-400">Share one of your garage vehicles with the community.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Vehicle</label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select a vehicle..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-white/10">
                  {userVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="text-zinc-300 focus:bg-red-500/10 focus:text-white">
                      {v.year} {v.make} {v.model} ({v.currentHP} HP)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Description</label>
              <Textarea value={buildDesc} onChange={(e) => setBuildDesc(e.target.value)} placeholder="Tell the community about your build..." className="bg-white/5 border-white/10 text-white min-h-[80px]" />
            </div>
            <Button onClick={handleShareBuild} disabled={!selectedVehicleId} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Share2 className="w-4 h-4 mr-2" /> Share Build
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Build Detail Dialog */}
      <Dialog open={showBuildDetail} onOpenChange={setShowBuildDetail}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedBuild?.vehicleName}</DialogTitle>
            <DialogDescription className="text-zinc-400">by {selectedBuild?.userName} · {selectedBuild && new Date(selectedBuild.dateShared).toLocaleDateString()}</DialogDescription>
          </DialogHeader>
          {selectedBuild && (
            <ShareCard
              vehicleName={selectedBuild.vehicleName}
              year={selectedBuild.year}
              make={selectedBuild.make}
              model={selectedBuild.model}
              engineCode={selectedBuild.engineCode}
              modList={selectedBuild.modList}
              totalHP={selectedBuild.currentHP}
              stockHP={selectedBuild.stockHP}
              totalInvested={selectedBuild.totalInvested}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
