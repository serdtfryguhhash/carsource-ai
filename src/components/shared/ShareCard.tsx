'use client';

import { useRef, useCallback } from 'react';
import { Wrench, Download, Copy, Check, Zap, DollarSign, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ShareCardProps {
  vehicleName: string;
  year: string;
  make: string;
  model: string;
  engineCode?: string;
  modList: string[];
  totalHP: number;
  stockHP: number;
  totalInvested: number;
  zeroToSixty?: string;
}

export default function ShareCard({
  vehicleName,
  year,
  make,
  model,
  engineCode,
  modList,
  totalHP,
  stockHP,
  totalInvested,
  zeroToSixty,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = `${vehicleName} Build Spec\n${totalHP}HP | $${totalInvested.toLocaleString()} invested\nMods: ${modList.join(', ')}\nBuilt with CarSource AI`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [vehicleName, totalHP, totalInvested, modList]);

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] border border-white/10 rounded-2xl overflow-hidden max-w-md mx-auto"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 p-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">CarSource AI</span>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Build Spec</p>
            <h3 className="text-2xl font-bold text-white mt-1">{vehicleName}</h3>
            <p className="text-sm text-zinc-400">{year} {make} {model} {engineCode && `| ${engineCode}`}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-400">{totalHP}</p>
              <p className="text-xs text-zinc-500">HP (+{totalHP - stockHP})</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <DollarSign className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-400">${totalInvested.toLocaleString()}</p>
              <p className="text-xs text-zinc-500">Invested</p>
            </div>
            {zeroToSixty && (
              <div className="bg-white/5 rounded-xl p-3 text-center col-span-2">
                <Timer className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-400">{zeroToSixty}s</p>
                <p className="text-xs text-zinc-500">Est. 0-60 MPH</p>
              </div>
            )}
          </div>

          {/* Mod List */}
          {modList.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Mod List</p>
              <div className="flex flex-wrap gap-1.5">
                {modList.slice(0, 8).map((mod, i) => (
                  <span
                    key={i}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-lg"
                  >
                    {mod}
                  </span>
                ))}
                {modList.length > 8 && (
                  <span className="text-xs text-zinc-500 px-2.5 py-1">
                    +{modList.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-zinc-500">Built with <span className="text-red-400">CarSource AI</span></span>
            </div>
            <span className="text-xs text-zinc-600">{modList.length} mods</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 max-w-md mx-auto">
        <Button
          onClick={handleCopy}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Build Spec
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
