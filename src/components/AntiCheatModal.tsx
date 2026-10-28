/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fairPlayMonitor, getRankTierFromMMR, RANKED_TIERS } from '../game/fairPlay';
import { ShieldCheck, ShieldAlert, Cpu, Activity, Award, CheckCircle, X } from 'lucide-react';

interface AntiCheatModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMMR: number;
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({
  isOpen,
  onClose,
  playerMMR,
}) => {
  if (!isOpen) return null;

  const metrics = fairPlayMonitor.getTelemetryMetrics();
  const currentTier = getRankTierFromMMR(playerMMR);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-950 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono uppercase tracking-wider text-white">
                VANGUARD FAIRPLAY & ANTI-CHEAT CORE
              </h2>
              <p className="text-xs text-slate-400">
                Pilar 3: Sistem Matchmaking Seimbang, Bebas Pay-to-Win, & Keamanan Anti-Cheat Kuat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Verification Badge */}
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-300">
                STATUS INTEGRITAS MATCH: TERVERIFIKASI ADIL & BERSIH
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Tidak ada manipulasi memori, skrip no-recoil otomatis, atau injeksi aim-assist yang terdeteksi.
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-mono text-emerald-400 font-bold">128-TICK RATE</div>
            <div className="text-[10px] text-slate-400">Competitive Server Sync</div>
          </div>
        </div>

        {/* Anti-Cheat Telemetry Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono">Variansi Recoil Alami</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {metrics.recoilConsistencyScore}%
            </div>
            <span className="text-[10px] text-slate-400">
              Skor 70-90% menandakan kontrol recoil tangan manusiawi (bebas script kaku).
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono">Entropi Input Mouse</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {metrics.mouseInputEntropy}
            </div>
            <span className="text-[10px] text-slate-400">
              Micro-jitter akselerasi pointer mengonfirmasi input refleks mouse organik.
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono">Validasi Hitbox Raycast</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {metrics.hitboxAngleValidationRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              Validasi sudut tembakan di sisi server (mencegah silent aimbot).
            </span>
          </div>
        </div>

        {/* Ranked Tier & Matchmaking Fair Play */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white uppercase font-mono">
                SISTEM PERINGKAT & MATCHMAKING BERIMBANG (SBMM)
              </span>
            </div>
            <div className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {currentTier.name} ({playerMMR} MMR)
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sistem Matchmaking Skill-Based (SBMM) memastikan pemain pemula hanya dipasangkan dengan pemain selevel. Pemain profesional berkompetisi di tingkat Platinum, Diamond, dan Radiant. Kemenangan mutlak ditentukan oleh ketajaman bidikan, koordinasi tim, dan respon taktis.
          </p>

          {/* Tier progression visualizer */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'].map((tName) => {
              const isActive = currentTier.tier === tName;
              return (
                <div
                  key={tName}
                  className={`p-2 rounded-lg text-center border text-xs font-mono flex flex-col items-center gap-1 ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] truncate">{tName}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bebas Pay-to-Win Pledge */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 text-xs text-slate-300">
          <strong className="text-white uppercase font-mono">KOMITMEN 100% BEBAS PAY-TO-WIN (P2W):</strong>
          <p>
            • Tidak ada senjata eksklusif berbayar yang memiliki keunggulan recoil atau damage lebih tinggi.
            <br />
            • Semua senjata (VK-47, Spectre-9, Aegis, Apex Longbow, Viper-5) terbuka secara default dan seimbang.
            <br />
            • Kosmetik dan skin senjata hanya didapatkan melalui pencapaian skill (Headshots, Kemenangan Taktis, dan Peringkat).
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            Tutup Panel Anti-Cheat
          </button>
        </div>
      </div>
    </div>
  );
};
