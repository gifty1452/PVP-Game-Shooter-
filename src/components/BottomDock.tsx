/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameModeId, HeroRoleId, WeaponId } from '../types/game';
import { WEAPON_REGISTRY } from '../game/weapons';
import { HERO_REGISTRY } from '../game/heroes';
import {
  Crosshair,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Target,
  Trophy,
  Sliders,
} from 'lucide-react';
import { soundFX } from '../game/audio';

interface BottomDockProps {
  currentWeaponId: WeaponId;
  onSelectWeapon: (id: WeaponId) => void;
  currentRole: HeroRoleId;
  onSelectRole: (role: HeroRoleId) => void;
  currentMode: GameModeId;
  onSelectMode: (mode: GameModeId) => void;
  onOpenWeaponBench: () => void;
  onOpenAntiCheat: () => void;
  onOpenScoreboard: () => void;
  onOpenSettings: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentWeaponId,
  onSelectWeapon,
  currentRole,
  onSelectRole,
  currentMode,
  onSelectMode,
  onOpenWeaponBench,
  onOpenAntiCheat,
  onOpenScoreboard,
  onOpenSettings,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'weapons' | 'modes' | 'roles' | 'system'>('weapons');
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      style={{
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(960px, 96vw)',
      }}
      className={`fixed z-30 transition-transform duration-300 pointer-events-auto ${
        isCollapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-4 py-1 rounded-full bg-slate-900/95 border border-slate-700/80 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 text-[11px] font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>▴ Tampilkan Menu Kontrol Taktis</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>▾ Sembunyikan Panel (Mode Layar Penuh)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Unified Horizontal Glassmorphic Dock */}
      <div className="bg-slate-950/95 border border-slate-800/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-2">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1 gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('weapons')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'weapons'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Arsenal Senjata</span>
            </button>

            <button
              onClick={() => setActiveTab('modes')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'modes'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mode Taktis</span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'roles'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Peran Hero</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenWeaponBench}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-400 flex items-center gap-1 cursor-pointer transition-all"
              title="Inspeksi Pola Recoil & TTK"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pola Recoil</span>
            </button>

            <button
              onClick={onOpenAntiCheat}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500/40 text-xs font-mono text-emerald-400 flex items-center gap-1 cursor-pointer transition-all hover:bg-emerald-500/10"
              title="FairPlay Anti-Cheat & Bebas P2W"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FairPlay Vanguard</span>
            </button>

            <button
              onClick={onOpenScoreboard}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-xs font-mono text-amber-400 flex items-center gap-1 cursor-pointer transition-all hover:bg-amber-500/10"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scoreboard</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Sensitivitas Mouse & Kontrol"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Content 1: Weapon Selector */}
        {activeTab === 'weapons' && (
          <div className="grid grid-cols-5 gap-2 pt-0.5">
            {Object.values(WEAPON_REGISTRY).map((w) => {
              const isSelected = w.id === currentWeaponId;
              return (
                <button
                  key={w.id}
                  onClick={() => onSelectWeapon(w.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span className="uppercase text-cyan-400 font-bold">{w.category}</span>
                    <span>{w.damageHead} Dmg (Head)</span>
                  </div>
                  <div className="text-xs font-bold truncate text-white">{w.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Mag: {w.magSize} • RPM: {w.fireRateRPM}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content 2: Game Mode Selector */}
        {activeTab === 'modes' && (
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <button
              onClick={() => onSelectMode('bomb_defusal')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                currentMode === 'bomb_defusal'
                  ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold text-white mb-0.5">Cari & Jinakkan Bom (Defusal)</div>
              <div className="text-[10px] text-slate-300">
                Mode taktis kompetitif 5v5. Pasang spike di Site A/B atau pertahankan sektor.
              </div>
            </button>

            <button
              onClick={() => onSelectMode('tdm')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                currentMode === 'tdm'
                  ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold text-white mb-0.5">Team Deathmatch (TDM)</div>
              <div className="text-[10px] text-slate-300">
                Baku tembak cepat tanpa henti dengan respawn instan untuk mengasah refleks gunplay.
              </div>
            </button>

            <button
              onClick={() => onSelectMode('firing_range')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                currentMode === 'firing_range'
                  ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold text-white mb-0.5">Latihan Recoil & Firing Range</div>
              <div className="text-[10px] text-slate-300">
                Uji pola recoil senjata pada dinding analisis, target dummy 10m/20m/30m, dan rintangan slide.
              </div>
            </button>
          </div>
        )}

        {/* Tab Content 3: Hero Role Selector */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            {Object.values(HERO_REGISTRY).map((h) => {
              const isSelected = h.id === currentRole;
              return (
                <button
                  key={h.id}
                  onClick={() => onSelectRole(h.id)}
                  style={{
                    borderColor: isSelected ? h.color : undefined,
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span style={{ color: h.accentColor }} className="font-bold uppercase">
                      {h.name}
                    </span>
                    <span className="text-slate-400">{h.roleName.split('/')[0]}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 line-clamp-2">
                    Q: {h.skillQ.name.split('(')[0]} | E: {h.skillE.name.split('(')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
