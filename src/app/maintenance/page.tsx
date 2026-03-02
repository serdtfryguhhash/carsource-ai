'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench, Plus, AlertTriangle, CheckCircle2, Clock, Car,
  Trash2, Calendar, Settings
} from 'lucide-react';
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
import { useAppStore, type MaintenanceItem } from '@/stores';
import { XP_ACTIONS } from '@/lib/gamification';

const DEFAULT_ITEMS = [
  { name: 'Oil Change', intervalMiles: 5000 },
  { name: 'Brake Pads', intervalMiles: 30000 },
  { name: 'Timing Belt', intervalMiles: 60000 },
  { name: 'Transmission Fluid', intervalMiles: 30000 },
  { name: 'Coolant Flush', intervalMiles: 30000 },
  { name: 'Spark Plugs', intervalMiles: 30000 },
  { name: 'Air Filter', intervalMiles: 15000 },
  { name: 'Tire Rotation', intervalMiles: 7500 },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MaintenancePage() {
  const maintenanceItems = useAppStore((s) => s.maintenanceItems);
  const userVehicles = useAppStore((s) => s.vehicles);
  const addMaintenanceItem = useAppStore((s) => s.addMaintenanceItem);
  const removeMaintenanceItem = useAppStore((s) => s.removeMaintenanceItem);
  const completeMaintenanceItem = useAppStore((s) => s.completeMaintenanceItem);
  const updateMaintenanceItem = useAppStore((s) => s.updateMaintenanceItem);
  const addXP = useAppStore((s) => s.addXP);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showMileageDialog, setShowMileageDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customInterval, setCustomInterval] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [completeCost, setCompleteCost] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeMileage, setCompleteMileage] = useState('');
  const [mileageUpdateId, setMileageUpdateId] = useState('');
  const [mileageValue, setMileageValue] = useState('');

  const handleAddPreset = (preset: typeof DEFAULT_ITEMS[0]) => {
    if (!vehicleId) return;
    const item: MaintenanceItem = {
      id: `mi-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      vehicleId,
      name: preset.name,
      intervalMiles: preset.intervalMiles,
      lastCompletedMileage: 0,
      lastCompletedDate: '',
      currentMileage: parseInt(currentMileage) || 0,
      isCustom: false,
      history: [],
    };
    addMaintenanceItem(item);
  };

  const handleAddCustom = () => {
    if (!vehicleId || !customName || !customInterval) return;
    const item: MaintenanceItem = {
      id: `mi-${Date.now()}`,
      vehicleId,
      name: customName,
      intervalMiles: parseInt(customInterval),
      lastCompletedMileage: 0,
      lastCompletedDate: '',
      currentMileage: parseInt(currentMileage) || 0,
      isCustom: true,
      history: [],
    };
    addMaintenanceItem(item);
    setCustomName('');
    setCustomInterval('');
  };

  const handleComplete = () => {
    if (!selectedItemId || !completeMileage) return;
    completeMaintenanceItem(
      selectedItemId,
      parseInt(completeMileage),
      parseInt(completeCost) || 0,
      completeNotes
    );
    addXP(XP_ACTIONS.COMPLETE_MAINTENANCE.amount, 'COMPLETE_MAINTENANCE');
    setSelectedItemId('');
    setCompleteMileage('');
    setCompleteCost('');
    setCompleteNotes('');
    setShowCompleteDialog(false);
  };

  const handleUpdateMileage = () => {
    if (!mileageUpdateId || !mileageValue) return;
    updateMaintenanceItem(mileageUpdateId, { currentMileage: parseInt(mileageValue) });
    setMileageUpdateId('');
    setMileageValue('');
    setShowMileageDialog(false);
  };

  const getStatus = (item: MaintenanceItem) => {
    if (item.lastCompletedMileage === 0 && item.currentMileage === 0) return 'unknown';
    const milesSinceService = item.currentMileage - item.lastCompletedMileage;
    if (milesSinceService >= item.intervalMiles) return 'overdue';
    if (milesSinceService >= item.intervalMiles * 0.8) return 'due-soon';
    return 'ok';
  };

  const grouped = useMemo(() => {
    const map = new Map<string, MaintenanceItem[]>();
    for (const item of maintenanceItems) {
      const existing = map.get(item.vehicleId) || [];
      existing.push(item);
      map.set(item.vehicleId, existing);
    }
    return map;
  }, [maintenanceItems]);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-500" />
              </div>
              <Badge variant="outline" className="border-green-500/30 text-green-400">Maintenance</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Maintenance</h1>
            <p className="text-zinc-400 text-lg mt-2 max-w-xl">
              Track your maintenance schedule. Never miss an oil change again.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700 text-white" disabled={userVehicles.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> Add Maintenance Items
          </Button>
          {userVehicles.length === 0 && (
            <p className="text-xs text-zinc-500 mt-2">Add a vehicle to your garage first.</p>
          )}
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {maintenanceItems.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No maintenance items</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">Add maintenance reminders to keep your car in top shape.</p>
            </motion.div>
          ) : (
            Array.from(grouped.entries()).map(([vId, items]) => {
              const vehicle = userVehicles.find((v) => v.id === vId);
              return (
                <div key={vId}>
                  <div className="flex items-center gap-2 mb-4">
                    <Car className="w-5 h-5 text-zinc-400" />
                    <h2 className="text-lg font-bold text-white">
                      {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => {
                      const status = getStatus(item);
                      const milesSince = item.currentMileage - item.lastCompletedMileage;
                      const milesUntilDue = item.intervalMiles - milesSince;
                      const progress = Math.min((milesSince / item.intervalMiles) * 100, 100);

                      return (
                        <motion.div key={item.id} variants={fadeInUp} initial="hidden" animate="visible">
                          <Card className={`bg-white/5 border-white/10 ${
                            status === 'overdue' ? 'border-red-500/40' :
                            status === 'due-soon' ? 'border-yellow-500/30' : ''
                          }`}>
                            <CardContent className="p-5 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {status === 'overdue' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                                  {status === 'due-soon' && <Clock className="w-4 h-4 text-yellow-400" />}
                                  {status === 'ok' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeMaintenanceItem(item.id)} className="text-zinc-600 hover:text-red-400 h-7 w-7">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-zinc-500">Every {item.intervalMiles.toLocaleString()} mi</span>
                                  <span className={
                                    status === 'overdue' ? 'text-red-400 font-medium' :
                                    status === 'due-soon' ? 'text-yellow-400' : 'text-zinc-400'
                                  }>
                                    {status === 'overdue' ? `${Math.abs(milesUntilDue).toLocaleString()} mi overdue` :
                                     status === 'unknown' ? 'Set mileage' :
                                     `${milesUntilDue.toLocaleString()} mi until due`}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      status === 'overdue' ? 'bg-red-500' :
                                      status === 'due-soon' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              {item.lastCompletedDate && (
                                <p className="text-xs text-zinc-500">
                                  Last: {new Date(item.lastCompletedDate).toLocaleDateString()} at {item.lastCompletedMileage.toLocaleString()} mi
                                </p>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => { setSelectedItemId(item.id); setCompleteMileage(item.currentMileage.toString()); setShowCompleteDialog(true); }}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setMileageUpdateId(item.id); setMileageValue(item.currentMileage.toString()); setShowMileageDialog(true); }}
                                  className="border-white/10 text-zinc-400 hover:text-white text-xs"
                                >
                                  Update Mi
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add Maintenance Items</DialogTitle>
            <DialogDescription className="text-zinc-400">Select a vehicle and add standard or custom items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Current Mileage</label>
              <Input type="number" value={currentMileage} onChange={(e) => setCurrentMileage(e.target.value)} placeholder="e.g. 45000" className="bg-white/5 border-white/10 text-white" />
            </div>

            {vehicleId && (
              <>
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Quick Add Common Items</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_ITEMS.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleAddPreset(item)}
                        className="text-left bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:border-green-500/30 hover:bg-green-500/5 transition-colors"
                      >
                        <p className="text-xs font-medium text-white">{item.name}</p>
                        <p className="text-[10px] text-zinc-500">Every {item.intervalMiles.toLocaleString()} mi</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white mb-2">Custom Item</p>
                  <div className="space-y-3">
                    <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Item name" className="bg-white/5 border-white/10 text-white" />
                    <Input type="number" value={customInterval} onChange={(e) => setCustomInterval(e.target.value)} placeholder="Interval (miles)" className="bg-white/5 border-white/10 text-white" />
                    <Button onClick={handleAddCustom} disabled={!customName || !customInterval} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Add Custom Item
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Complete Maintenance</DialogTitle>
            <DialogDescription className="text-zinc-400">Log this maintenance as completed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Mileage</label>
              <Input type="number" value={completeMileage} onChange={(e) => setCompleteMileage(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Cost ($)</label>
              <Input type="number" value={completeCost} onChange={(e) => setCompleteCost(e.target.value)} placeholder="Optional" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Notes</label>
              <Input value={completeNotes} onChange={(e) => setCompleteNotes(e.target.value)} placeholder="Optional" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button onClick={handleComplete} disabled={!completeMileage} className="w-full bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mileage Update Dialog */}
      <Dialog open={showMileageDialog} onOpenChange={setShowMileageDialog}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Update Mileage</DialogTitle>
            <DialogDescription className="text-zinc-400">Update the current mileage for this item.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="number" value={mileageValue} onChange={(e) => setMileageValue(e.target.value)} placeholder="Current mileage" className="bg-white/5 border-white/10 text-white" />
            <Button onClick={handleUpdateMileage} disabled={!mileageValue} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
