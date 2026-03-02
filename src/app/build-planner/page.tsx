'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Trash2, CheckCircle2, Circle, Zap, DollarSign,
  ChevronDown, ChevronUp, Settings, ArrowRight, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore, type BuildPlan, type BuildStage, type BuildStagePart } from '@/stores';
import { modParts } from '@/data/parts';
import { XP_ACTIONS } from '@/lib/gamification';

const STAGE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
const STAGE_PRESETS = ['Stage 1: Bolt-Ons', 'Stage 2: Forced Induction', 'Stage 3: Engine Internals', 'Stage 4: Full Build'];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BuildPlannerPage() {
  const buildPlans = useAppStore((s) => s.buildPlans);
  const userVehicles = useAppStore((s) => s.vehicles);
  const addBuildPlan = useAppStore((s) => s.addBuildPlan);
  const removeBuildPlan = useAppStore((s) => s.removeBuildPlan);
  const updateBuildPlan = useAppStore((s) => s.updateBuildPlan);
  const toggleStageComplete = useAppStore((s) => s.toggleStageComplete);
  const addXP = useAppStore((s) => s.addXP);
  const checkAchievements = useAppStore((s) => s.checkAchievements);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddStageDialog, setShowAddStageDialog] = useState(false);
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // Create form
  const [planName, setPlanName] = useState('');
  const [planVehicleId, setPlanVehicleId] = useState('');
  const [stageName, setStageName] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');

  const handleCreatePlan = () => {
    if (!planName) return;
    const plan: BuildPlan = {
      id: `bp-${Date.now()}`,
      vehicleId: planVehicleId,
      name: planName,
      stages: [],
      dateCreated: new Date().toISOString(),
    };
    addBuildPlan(plan);
    setPlanName('');
    setPlanVehicleId('');
    setShowCreateDialog(false);
    setExpandedPlan(plan.id);
  };

  const handleAddStage = () => {
    if (!activePlanId || !stageName) return;
    const plan = buildPlans.find((p) => p.id === activePlanId);
    if (!plan) return;
    const newStage: BuildStage = {
      id: `st-${Date.now()}`,
      name: stageName,
      order: plan.stages.length + 1,
      parts: [],
      completed: false,
    };
    updateBuildPlan(activePlanId, { stages: [...plan.stages, newStage] });
    setStageName('');
    setShowAddStageDialog(false);
  };

  const handleAddPartToStage = () => {
    if (!activePlanId || !activeStageId || !selectedPartId) return;
    const plan = buildPlans.find((p) => p.id === activePlanId);
    if (!plan) return;
    const part = modParts.find((p) => p.id === selectedPartId);
    if (!part) return;
    const newPart: BuildStagePart = {
      id: `bsp-${Date.now()}`,
      partId: part.id,
      partName: part.name,
      category: part.category,
      estimatedCost: part.price,
      estimatedHpGain: part.hp_gain,
      estimatedTorqueGain: part.torque_gain,
    };
    const updatedStages = plan.stages.map((s) =>
      s.id === activeStageId ? { ...s, parts: [...s.parts, newPart] } : s
    );
    updateBuildPlan(activePlanId, { stages: updatedStages });
    setSelectedPartId('');
    setShowAddPartDialog(false);
  };

  const handleToggleStage = (planId: string, stageId: string) => {
    const plan = buildPlans.find((p) => p.id === planId);
    const stage = plan?.stages.find((s) => s.id === stageId);
    if (stage && !stage.completed) {
      addXP(XP_ACTIONS.COMPLETE_STAGE.amount, 'COMPLETE_STAGE');
      checkAchievements();
    }
    toggleStageComplete(planId, stageId);
  };

  const removePartFromStage = (planId: string, stageId: string, partId: string) => {
    const plan = buildPlans.find((p) => p.id === planId);
    if (!plan) return;
    const updatedStages = plan.stages.map((s) =>
      s.id === stageId ? { ...s, parts: s.parts.filter((p) => p.id !== partId) } : s
    );
    updateBuildPlan(planId, { stages: updatedStages });
  };

  const removeStage = (planId: string, stageId: string) => {
    const plan = buildPlans.find((p) => p.id === planId);
    if (!plan) return;
    updateBuildPlan(planId, { stages: plan.stages.filter((s) => s.id !== stageId) });
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-orange-500" />
              </div>
              <Badge variant="outline" className="border-orange-500/30 text-orange-400">Build Planner</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Build Planner</h1>
            <p className="text-zinc-400 text-lg mt-2 max-w-xl">
              Plan your build in stages. Track costs, HP gains, and progress toward your dream setup.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Build Plan
          </Button>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {buildPlans.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No build plans yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">Create your first build plan to start mapping out your modification stages.</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Create Build Plan
              </Button>
            </motion.div>
          ) : (
            buildPlans.map((plan) => {
              const totalCost = plan.stages.reduce((s, st) => s + st.parts.reduce((ps, p) => ps + p.estimatedCost, 0), 0);
              const totalHP = plan.stages.reduce((s, st) => s + st.parts.reduce((ps, p) => ps + p.estimatedHpGain, 0), 0);
              const completedStages = plan.stages.filter((s) => s.completed).length;
              const isExpanded = expandedPlan === plan.id;
              const vehicle = userVehicles.find((v) => v.id === plan.vehicleId);

              const chartData = plan.stages.map((st, i) => ({
                name: st.name,
                hp: st.parts.reduce((s, p) => s + p.estimatedHpGain, 0),
                cost: st.parts.reduce((s, p) => s + p.estimatedCost, 0),
                fill: STAGE_COLORS[i % STAGE_COLORS.length],
              }));

              return (
                <motion.div key={plan.id} variants={fadeInUp} initial="hidden" animate="visible">
                  <Card className="bg-white/5 border-white/10 overflow-hidden">
                    <CardContent className="p-0">
                      {/* Plan Header */}
                      <div
                        className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            {vehicle && <p className="text-sm text-zinc-500">{vehicle.year} {vehicle.make} {vehicle.model}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-400">+{totalHP} HP</p>
                              <p className="text-xs text-yellow-400">${totalCost.toLocaleString()}</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-zinc-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-zinc-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                            {plan.stages.length} stages
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                            {completedStages}/{plan.stages.length} complete
                          </Badge>
                          {/* Progress bar */}
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                              style={{ width: `${plan.stages.length > 0 ? (completedStages / plan.stages.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] as const }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 space-y-6 border-t border-white/5 pt-6">
                              {/* Chart */}
                              {chartData.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-orange-400" /> HP Per Stage
                                  </p>
                                  <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#666" fontSize={11} />
                                        <YAxis stroke="#666" fontSize={11} />
                                        <Tooltip
                                          contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                          formatter={(value: number | undefined) => value !== undefined ? `+${value} HP` : ''}
                                        />
                                        <Bar dataKey="hp" radius={[4, 4, 0, 0]}>
                                          {chartData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.fill} />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              )}

                              {/* Stages */}
                              {plan.stages.map((stage, stageIdx) => (
                                <div key={stage.id} className="bg-white/[0.03] rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => handleToggleStage(plan.id, stage.id)}
                                        className="flex-shrink-0"
                                      >
                                        {stage.completed ? (
                                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                                        ) : (
                                          <Circle className="w-6 h-6 text-zinc-600 hover:text-zinc-400 transition-colors" />
                                        )}
                                      </button>
                                      <div>
                                        <p className={`text-sm font-bold ${stage.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                          {stage.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                          +{stage.parts.reduce((s, p) => s + p.estimatedHpGain, 0)} HP ·
                                          ${stage.parts.reduce((s, p) => s + p.estimatedCost, 0).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setActivePlanId(plan.id); setActiveStageId(stage.id); setShowAddPartDialog(true); }}
                                        className="text-zinc-500 hover:text-white h-7 text-xs"
                                      >
                                        <Plus className="w-3 h-3 mr-1" /> Part
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeStage(plan.id, stage.id)}
                                        className="text-zinc-600 hover:text-red-400 h-7 w-7 p-0"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  {stage.parts.length > 0 && (
                                    <div className="ml-9 space-y-1.5">
                                      {stage.parts.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2">
                                          <div>
                                            <p className="text-xs font-medium text-zinc-300">{p.partName}</p>
                                            <p className="text-[10px] text-zinc-600">{p.category}</p>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-400">+{p.estimatedHpGain} HP</span>
                                            <span className="text-xs text-yellow-400">${p.estimatedCost.toLocaleString()}</span>
                                            <button
                                              onClick={() => removePartFromStage(plan.id, stage.id, p.id)}
                                              className="text-zinc-600 hover:text-red-400"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Add Stage + Delete */}
                              <div className="flex gap-3">
                                <Button
                                  size="sm"
                                  onClick={() => { setActivePlanId(plan.id); setShowAddStageDialog(true); }}
                                  variant="outline"
                                  className="border-white/10 text-zinc-400 hover:text-white flex-1"
                                >
                                  <Plus className="w-4 h-4 mr-2" /> Add Stage
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => removeBuildPlan(plan.id)}
                                  variant="outline"
                                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Plan
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">New Build Plan</DialogTitle>
            <DialogDescription className="text-zinc-400">Create a multi-stage build plan for your vehicle.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Plan Name</label>
              <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Project 500HP STI" className="bg-white/5 border-white/10 text-white" />
            </div>
            {userVehicles.length > 0 && (
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Vehicle (optional)</label>
                <Select value={planVehicleId} onValueChange={setPlanVehicleId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Link to a garage vehicle..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f2e] border-white/10">
                    {userVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-zinc-300 focus:bg-red-500/10 focus:text-white">
                        {v.year} {v.make} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleCreatePlan} disabled={!planName} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              Create Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Stage Dialog */}
      <Dialog open={showAddStageDialog} onOpenChange={setShowAddStageDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Add Stage</DialogTitle>
            <DialogDescription className="text-zinc-400">Add a new stage to your build plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Stage Name</label>
              <Input value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="e.g. Stage 1: Bolt-Ons" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex flex-wrap gap-2">
              {STAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setStageName(preset)}
                  className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-zinc-400 hover:text-white hover:border-orange-500/30 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
            <Button onClick={handleAddStage} disabled={!stageName} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              Add Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Add Part to Stage</DialogTitle>
            <DialogDescription className="text-zinc-400">Select a part from the catalog.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedPartId} onValueChange={setSelectedPartId}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select a part..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-white/10 max-h-60">
                {modParts.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-zinc-300 focus:bg-red-500/10 focus:text-white">
                    {p.brand} {p.name} (+{p.hp_gain}HP, ${p.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddPartToStage} disabled={!selectedPartId} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              Add Part
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
