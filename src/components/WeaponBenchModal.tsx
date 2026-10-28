/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WeaponId, WeaponSkin } from '../types/game';
import { calculateTTK, WEAPON_MASTERY_SKINS, WEAPON_REGISTRY } from '../game/weapons';
import { X, Target, Zap, ShieldAlert, Award, CheckCircle2 } from 'lucide-react';

interface WeaponBenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWeaponId: WeaponId;
  onSelectWeapon: (id: WeaponId) => void;
}

export const WeaponBenchModal: React.FC<WeaponBenchModalProps> = ({
  isOpen,
  onClose,
  activeWeaponId,
  onSelectWeapon,
}) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState<WeaponId>(activeWeaponId);
  const [activeSkinTab, setActiveSkinTab] = useState<'bench' | 'mastery'>('bench');

  if (!isOpen) return null;

  const weapon = WEAPON_REGISTRY[selectedWeaponId];
  const ttkHead = calculateTTK(weapon, 'head');
  const ttkBody = calculateTTK(weapon, 'body');
  const ttkMixed = calculateTTK(weapon, 'mixed');

  const weaponSkins = WEAPON_MASTERY_SKINS.filter((s) => s.weaponId === selectedWeaponId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-950 border border-cyan-500/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono uppercase tracking-wider text-white">
                MEJA SENJATA & ANALISIS RECOIL
              </h2>
              <p className="text-xs text-slate-400">
                Pilar 1: Presisi Recoil & Waktu Bunuh (TTK) • Pilar 3: Integritas Kompetitif Bebas Pay-to-Win
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

        {/* Weapon Selection Tabs */}
        <div className="grid grid-cols-5 gap-2">
          {Object.values(WEAPON_REGISTRY).map((w) => {
            const isSel = w.id === selectedWeaponId;
            return (
              <button
                key={w.id}
                onClick={() => {
                  setSelectedWeaponId(w.id);
                  onSelectWeapon(w.id);
                }}
                className={`py-2 px-3 rounded-xl text-left border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">{w.category}</div>
                <div className="text-xs font-bold truncate">{w.name}</div>
              </button>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Recoil Pattern Visualizer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                POLA RECOIL SPRAY 10-PELURU
              </span>
              <span className="text-[10px] font-mono text-slate-400">Tarik mouse berlawanan pola</span>
            </div>

            {/* Recoil Graph Canvas simulation */}
            <div className="relative w-full h-56 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-15 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-cyan-500" />
                ))}
              </div>

              {/* Center crosshair benchmark origin */}
              <div className="absolute w-3 h-3 border border-red-500/80 rounded-full" />
              <div className="absolute w-full h-[1px] bg-red-500/20" />
              <div className="absolute h-full w-[1px] bg-red-500/20" />

              {/* Plot 10 Recoil Pattern Points */}
              {weapon.recoilPattern.map((pt, idx) => {
                // Scale coordinate offsets for UI visibility
                let accumX = 0;
                let accumY = 0;
                for (let k = 0; k <= idx; k++) {
                  accumX += weapon.recoilPattern[k].x * 1200;
                  accumY += weapon.recoilPattern[k].y * 220;
                }

                return (
                  <div
                    key={idx}
                    style={{
                      transform: `translate(${accumX}px, ${-accumY + 70}px)`,
                    }}
                    className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-cyan-400 border border-slate-950 flex items-center justify-center shadow-xs shadow-cyan-400"
                    title={`Peluru #${idx + 1}`}
                  >
                    <span className="text-[8px] font-mono font-bold text-slate-950">{idx + 1}</span>
                  </div>
                );
              })}

              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded">
                Titik merah = Titik bidik awal
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {weapon.description}
            </p>
          </div>

          {/* Right Column: Time-to-Kill (TTK) & Weapon Specs */}
          <div className="flex flex-col gap-4">
            {/* TTK Breakdown Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                ANALISIS TIME-TO-KILL (TTK) vs 150 TOTAL EHP (100 HP + 50 ARMOR)
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-red-500/30 flex flex-col items-center text-center">
                  <span className="text-[10px] text-red-400 font-mono">HEADSHOT PENUH</span>
                  <span className="text-xl font-black font-mono text-white">{ttkHead.ttkSeconds}s</span>
                  <span className="text-[10px] text-slate-400">{ttkHead.shotsToKill} Peluru</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-yellow-500/30 flex flex-col items-center text-center">
                  <span className="text-[10px] text-yellow-400 font-mono">1 HEAD + BODY</span>
                  <span className="text-xl font-black font-mono text-white">{ttkMixed.ttkSeconds}s</span>
                  <span className="text-[10px] text-slate-400">{ttkMixed.shotsToKill} Peluru</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/30 flex flex-col items-center text-center">
                  <span className="text-[10px] text-cyan-400 font-mono">BODYSHOT SEMUA</span>
                  <span className="text-xl font-black font-mono text-white">{ttkBody.ttkSeconds}s</span>
                  <span className="text-[10px] text-slate-400">{ttkBody.shotsToKill} Peluru</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Pilar 1 menjamin TTK seimbang: pemain yang membidik kepala mendapat reward kill cepat (~0.2s - 0.4s), sementara tembakan badan memberikan waktu respon balik bagi lawan (~0.8s - 1.2s).
              </div>
            </div>

            {/* Fair-Play Weapon Mastery Skins */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  SKIN MASTERY BEBAS PAY-TO-WIN (100% SKILL-EARNED)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  STAT ZERO BOOST
                </span>
              </div>

              <p className="text-[11px] text-slate-300">
                Semua skin hanya memodifikasi tampilan estetika (warna & material PBR). Tidak ada peningkatan damage atau pengurangan recoil dari pembelian uang asli!
              </p>

              <div className="flex flex-col gap-2 mt-1">
                {weaponSkins.map((skin) => (
                  <div
                    key={skin.id}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: skin.colorHex, borderColor: skin.accentHex }}
                        className="w-5 h-5 rounded-full border-2 shadow-xs"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{skin.name}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">[{skin.rarity}]</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{skin.unlockRequirement}</div>
                      </div>
                    </div>

                    {skin.isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        TERBUKA
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                        TERKUNCI
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            Tutup & Lanjutkan Laga
          </button>
        </div>
      </div>
    </div>
  );
};
