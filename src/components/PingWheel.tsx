/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PingType } from '../types/game';
import { Shield, Zap, AlertTriangle, LifeBuoy, Package } from 'lucide-react';

interface PingWheelProps {
  isOpen: boolean;
  onSelect: (type: PingType) => void;
  onClose: () => void;
}

const PING_OPTIONS: { type: PingType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'danger', label: 'Musuh Terlihat!', icon: <AlertTriangle className="w-5 h-5" />, color: '#ef4444' },
  { type: 'push', label: 'Maju / Dorong!', icon: <Zap className="w-5 h-5" />, color: '#10b981' },
  { type: 'defend', label: 'Bertahan di Sini', icon: <Shield className="w-5 h-5" />, color: '#06b6d4' },
  { type: 'help', label: 'Butuh Bantuan!', icon: <LifeBuoy className="w-5 h-5" />, color: '#f59e0b' },
  { type: 'loot', label: 'Amunisi / Senjata', icon: <Package className="w-5 h-5" />, color: '#a855f7' },
];

export const PingWheel: React.FC<PingWheelProps> = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="relative w-80 h-80 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Center circle */}
        <div className="w-24 h-24 rounded-full bg-slate-900/90 border border-cyan-500/50 flex flex-col items-center justify-center text-center p-2 shadow-2xl shadow-cyan-500/20">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Roda Ping</span>
          <span className="text-[10px] text-slate-400">Pilih Taktik</span>
        </div>

        {/* 5 Radial Buttons */}
        {PING_OPTIONS.map((opt, idx) => {
          const angle = (idx / PING_OPTIONS.length) * (Math.PI * 2) - Math.PI / 2;
          const radius = 108; // px from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={opt.type}
              onClick={() => {
                onSelect(opt.type);
                onClose();
              }}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                borderColor: opt.color,
              }}
              className="absolute w-24 h-20 rounded-xl bg-slate-900/95 border-2 flex flex-col items-center justify-center gap-1.5 p-1 text-white hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-cyan-500/30 cursor-pointer group"
            >
              <div style={{ color: opt.color }} className="group-hover:scale-110 transition-transform">
                {opt.icon}
              </div>
              <span className="text-[10px] font-bold text-center leading-tight line-clamp-2 px-1">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
