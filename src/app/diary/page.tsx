'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, Zap, Calendar, ChevronDown,
  Smile, Frown, Meh, Heart, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore, type DiaryEntry } from '@/stores';
import { XP_ACTIONS } from '@/lib/gamification';

const MOODS = [
  { value: 'excited' as const, label: 'Excited', icon: Sparkles, color: 'text-yellow-400' },
  { value: 'great' as const, label: 'Great', icon: Heart, color: 'text-red-400' },
  { value: 'good' as const, label: 'Good', icon: Smile, color: 'text-green-400' },
  { value: 'neutral' as const, label: 'Neutral', icon: Meh, color: 'text-zinc-400' },
  { value: 'frustrated' as const, label: 'Frustrated', icon: Frown, color: 'text-orange-400' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DiaryPage() {
  const diaryEntries = useAppStore((s) => s.diaryEntries);
  const userVehicles = useAppStore((s) => s.vehicles);
  const addDiaryEntry = useAppStore((s) => s.addDiaryEntry);
  const removeDiaryEntry = useAppStore((s) => s.removeDiaryEntry);
  const addXP = useAppStore((s) => s.addXP);
  const checkAchievements = useAppStore((s) => s.checkAchievements);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [parts, setParts] = useState('');
  const [beforeHP, setBeforeHP] = useState('');
  const [afterHP, setAfterHP] = useState('');
  const [mood, setMood] = useState<DiaryEntry['mood']>('good');

  const handleAdd = () => {
    if (!title) return;
    const entry: DiaryEntry = {
      id: `de-${Date.now()}`,
      vehicleId,
      date: new Date().toISOString(),
      title,
      description,
      partsInstalled: parts.split(',').map((p) => p.trim()).filter(Boolean),
      beforeHP: parseInt(beforeHP) || 0,
      afterHP: parseInt(afterHP) || 0,
      mood,
    };
    addDiaryEntry(entry);
    addXP(XP_ACTIONS.WRITE_DIARY.amount, 'WRITE_DIARY');
    checkAchievements();
    resetForm();
    setShowAddDialog(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVehicleId('');
    setParts('');
    setBeforeHP('');
    setAfterHP('');
    setMood('good');
  };

  const sortedEntries = [...diaryEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">Mod Diary</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Mod Diary</h1>
            <p className="text-zinc-400 text-lg mt-2">
              Document your build journey. Log mods, issues, and results.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Entry
          </Button>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {sortedEntries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No diary entries yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">Start documenting your build journey.</p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Write Your First Entry
              </Button>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

              <div className="space-y-8">
                {sortedEntries.map((entry, i) => {
                  const vehicle = userVehicles.find((v) => v.id === entry.vehicleId);
                  const moodConfig = MOODS.find((m) => m.value === entry.mood) || MOODS[2];
                  const MoodIcon = moodConfig.icon;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease: [0.32, 0.72, 0, 1] as const }}
                      className="relative pl-16"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </div>

                      <Card className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="text-xs text-zinc-500">
                                  {new Date(entry.date).toLocaleDateString('en-US', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                              {vehicle && (
                                <p className="text-sm text-zinc-500">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1 ${moodConfig.color}`}>
                                <MoodIcon className="w-4 h-4" />
                                <span className="text-xs">{moodConfig.label}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDiaryEntry(entry.id)}
                                className="text-zinc-600 hover:text-red-400 h-7 w-7"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          {entry.description && (
                            <p className="text-sm text-zinc-300 leading-relaxed">{entry.description}</p>
                          )}

                          {entry.partsInstalled.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {entry.partsInstalled.map((part, pi) => (
                                <Badge key={pi} variant="outline" className="border-purple-500/20 text-purple-400 text-xs">
                                  {part}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {(entry.beforeHP > 0 || entry.afterHP > 0) && (
                            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
                              <Zap className="w-4 h-4 text-zinc-500" />
                              <span className="text-sm text-zinc-400">{entry.beforeHP} HP</span>
                              <span className="text-zinc-600">→</span>
                              <span className="text-sm font-bold text-green-400">{entry.afterHP} HP</span>
                              {entry.afterHP > entry.beforeHP && (
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                                  +{entry.afterHP - entry.beforeHP} HP
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">New Diary Entry</DialogTitle>
            <DialogDescription className="text-zinc-400">Document what you did today on your build.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Installed turbo kit" className="bg-white/5 border-white/10 text-white" />
            </div>
            {userVehicles.length > 0 && (
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Vehicle</label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select vehicle..." />
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
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you do? Any issues?" className="bg-white/5 border-white/10 text-white min-h-[100px]" />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Parts Installed (comma-separated)</label>
              <Input value={parts} onChange={(e) => setParts(e.target.value)} placeholder="e.g. Turbo kit, Intercooler, Downpipe" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Before HP</label>
                <Input type="number" value={beforeHP} onChange={(e) => setBeforeHP(e.target.value)} placeholder="e.g. 300" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">After HP</label>
                <Input type="number" value={afterHP} onChange={(e) => setAfterHP(e.target.value)} placeholder="e.g. 400" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Mood</label>
              <div className="flex gap-2">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${
                        mood === m.value
                          ? 'border-purple-500/50 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${m.color}`} />
                      <span className="text-[10px] text-zinc-400">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button onClick={handleAdd} disabled={!title} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <BookOpen className="w-4 h-4 mr-2" /> Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
