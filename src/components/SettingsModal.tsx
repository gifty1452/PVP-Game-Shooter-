/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Volume2, MousePointer, X } from 'lucide-react';
import { soundFX } from '../game/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mouseSensitivity: number;
  onSensitivityChange: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  mouseSensitivity,
  onSensitivityChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono uppercase tracking-wider text-white">
                PENGATURAN KONTROL & RESPON
              </h2>
              <p className="text-xs text-slate-400">Kalibrasi sensivitas bidikan dan volume audio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sensitivity slider */}
        <div className="flex flex-col gap-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              SENSITIVITAS MOUSE (AIM RESPONSE)
            </span>
            <span className="text-xs font-mono text-white font-bold">
              {(mouseSensitivity * 1000).toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.0008"
            max="0.0050"
            step="0.0001"
            value={mouseSensitivity}
            onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400">
            Sesuaikan untuk kontrol recoil yang nyaman saat menarik mouse ke bawah.
          </span>
        </div>

        {/* Volume slider */}
        <div className="flex flex-col gap-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              VOLUME EFEK SUARA (SFX)
            </span>
            <span className="text-xs font-mono text-white font-bold">
              {Math.round(soundFX.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundFX.volume}
            onChange={(e) => soundFX.setVolume(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400">
            Termasuk suara hentakan tembakan, slide swoosh, bunyi headshot ding, dan radio ping tim.
          </span>
        </div>

        {/* Controls Summary */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-1.5">
          <strong className="text-white font-mono uppercase">PANDUAN KONTROL CEPAT:</strong>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
            <div><span className="text-cyan-400 font-bold">WASD:</span> Gerakan Taktis</div>
            <div><span className="text-cyan-400 font-bold">SHIFT:</span> Sprint Cepat</div>
            <div><span className="text-cyan-400 font-bold">C / CTRL:</span> Luncuran (Slide)</div>
            <div><span className="text-cyan-400 font-bold">SPASI:</span> Lompat / Jump</div>
            <div><span className="text-cyan-400 font-bold">KLIK KANAN:</span> Bidik Scope (ADS)</div>
            <div><span className="text-cyan-400 font-bold">Q & E:</span> Keahlian Hero</div>
            <div><span className="text-cyan-400 font-bold">Z:</span> Roda Ping Taktis</div>
            <div><span className="text-cyan-400 font-bold">TAB:</span> Papan Skor Pertandingan</div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
