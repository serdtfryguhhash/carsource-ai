'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, Plus, Trash2, TrendingDown, TrendingUp, Bell,
  DollarSign, ShoppingCart, Tag
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
import { useAppStore, type WatchlistPart, type PricePoint } from '@/stores';
import { modParts } from '@/data/parts';
import { XP_ACTIONS } from '@/lib/gamification';

function generatePriceHistory(basePrice: number): PricePoint[] {
  const history: PricePoint[] = [];
  const now = new Date();
  let price = basePrice;
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const fluctuation = (Math.random() - 0.45) * 0.04;
    price = Math.max(Math.round(basePrice * 0.75), Math.round(price * (1 + fluctuation)));
    history.push({ date: date.toISOString().split('T')[0], price });
  }
  return history;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function WatchlistPage() {
  const watchlistParts = useAppStore((s) => s.watchlistParts);
  const addToWatchlist = useAppStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useAppStore((s) => s.removeFromWatchlist);
  const updateWatchlistPrices = useAppStore((s) => s.updateWatchlistPrices);
  const addXP = useAppStore((s) => s.addXP);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState<WatchlistPart | null>(null);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  // Simulate price updates
  useEffect(() => {
    if (watchlistParts.length > 0) {
      updateWatchlistPrices();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = () => {
    if (!selectedPartId) return;
    const part = modParts.find((p) => p.id === selectedPartId);
    if (!part) return;
    const priceHistory = generatePriceHistory(part.price);
    const wp: WatchlistPart = {
      id: `wp-${Date.now()}`,
      partId: part.id,
      partName: part.name,
      partSlug: part.slug,
      brand: part.brand,
      currentPrice: priceHistory[priceHistory.length - 1].price,
      originalPrice: part.price,
      priceHistory,
      dateAdded: new Date().toISOString(),
      targetPrice: parseInt(targetPrice) || Math.round(part.price * 0.85),
      category: part.category,
    };
    addToWatchlist(wp);
    addXP(XP_ACTIONS.ADD_WATCHLIST.amount, 'ADD_WATCHLIST');
    setSelectedPartId('');
    setTargetPrice('');
    setShowAddDialog(false);
  };

  const wishlistTotal = watchlistParts.reduce((s, p) => s + p.currentPrice, 0);
  const totalSavings = watchlistParts.reduce((s, p) => s + (p.originalPrice - p.currentPrice), 0);

  const alerts = watchlistParts.filter((p) => p.currentPrice <= p.targetPrice);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-cyan-500" />
              </div>
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">Watchlist</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Price Watchlist</h1>
            <p className="text-zinc-400 text-lg mt-2 max-w-xl">
              Track part prices and get alerted when they drop to your target.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {watchlistParts.length > 0 && (
        <section className="px-4 pb-6">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-white">${wishlistTotal.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">Watchlist Total</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${totalSavings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalSavings > 0 ? '-' : '+'}${Math.abs(totalSavings).toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">vs. Original</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-cyan-400">{watchlistParts.length}</p>
                <p className="text-xs text-zinc-500">Watching</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="px-4 pb-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-green-400" />
                  <p className="text-sm font-bold text-green-400">Price Alerts!</p>
                </div>
                {alerts.map((a) => (
                  <p key={a.id} className="text-sm text-zinc-300">
                    <span className="font-medium">{a.partName}</span> dropped to{' '}
                    <span className="text-green-400 font-bold">${a.currentPrice}</span>{' '}
                    (target: ${a.targetPrice})
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => setShowAddDialog(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Watch a Part
          </Button>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {watchlistParts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Watchlist is empty</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">Add parts to track their prices over time.</p>
            </motion.div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlistParts.map((wp) => {
                const priceChange = wp.currentPrice - wp.originalPrice;
                const priceDown = priceChange < 0;
                const atTarget = wp.currentPrice <= wp.targetPrice;

                return (
                  <motion.div key={wp.id} variants={fadeInUp} transition={{ duration: 0.3 }}>
                    <Card className={`bg-white/5 border-white/10 hover:border-cyan-500/40 transition-all card-glow ${atTarget ? 'border-green-500/40' : ''}`}>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-cyan-400 font-medium">{wp.brand}</p>
                            <h3 className="text-sm font-bold text-white mt-0.5">{wp.partName}</h3>
                            <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs mt-1">
                              {wp.category}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeFromWatchlist(wp.id)} className="text-zinc-600 hover:text-red-400 h-7 w-7">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">${wp.currentPrice.toLocaleString()}</p>
                            <div className={`flex items-center gap-1 ${priceDown ? 'text-green-400' : 'text-red-400'}`}>
                              {priceDown ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                              <span className="text-xs font-medium">
                                {priceDown ? '-' : '+'}${Math.abs(priceChange).toLocaleString()} ({Math.abs(Math.round((priceChange / wp.originalPrice) * 100))}%)
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500">Target</p>
                            <p className={`text-sm font-bold ${atTarget ? 'text-green-400' : 'text-zinc-400'}`}>${wp.targetPrice.toLocaleString()}</p>
                          </div>
                        </div>

                        {atTarget && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 w-full justify-center">
                            <Tag className="w-3 h-3 mr-1" /> Price dropped below target!
                          </Badge>
                        )}

                        {/* Mini chart */}
                        <div className="h-20 -mx-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={wp.priceHistory.slice(-14)}>
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke={priceDown ? '#22c55e' : '#ef4444'}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedWatch(wp); setShowChartDialog(true); }}
                          className="w-full border-white/10 text-zinc-400 hover:text-white text-xs"
                        >
                          View Full Price History
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Watch a Part</DialogTitle>
            <DialogDescription className="text-zinc-400">Add a part to track its price over time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedPartId} onValueChange={setSelectedPartId}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select a part..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-white/10 max-h-60">
                {modParts.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-zinc-300 focus:bg-red-500/10 focus:text-white">
                    {p.brand} {p.name} (${p.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Target Price ($)</label>
              <Input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="Alert me at this price" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button onClick={handleAdd} disabled={!selectedPartId} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              <Eye className="w-4 h-4 mr-2" /> Start Watching
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chart Dialog */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedWatch?.partName}</DialogTitle>
            <DialogDescription className="text-zinc-400">{selectedWatch?.brand} · 30-day price history</DialogDescription>
          </DialogHeader>
          {selectedWatch && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedWatch.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(d: string) => d.slice(5)} />
                  <YAxis stroke="#666" fontSize={11} domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip
                    contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number | undefined) => value !== undefined ? `$${value}` : ''}
                  />
                  <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
