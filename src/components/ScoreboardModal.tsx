/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { BotOperative } from '../game/botAI';
import { Trophy, X } from 'lucide-react';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerStats: PlayerStats;
  scoreAllies: number;
  scoreEnemies: number;
  bots: BotOperative[];
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  onClose,
  playerStats,
  scoreAllies,
  scoreEnemies,
  bots,
}) => {
  if (!isOpen) return null;

  const allyBots = bots.filter((b) => b.team === 'allies');
  const enemyBots = bots.filter((b) => b.team === 'enemies');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-950 border border-amber-500/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono uppercase tracking-wider text-white">
                PAPAN SKOR TAKTIS KOMPETITIF
              </h2>
              <p className="text-xs text-slate-400">
                Skor Pertempuran Berimbang • Evaluasi Kontribusi Tim & Efisiensi Gunplay
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

        {/* Score Banner */}
        <div className="flex items-center justify-around bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-center">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase">TIM KITA (DEFENDERS)</span>
            <div className="text-4xl font-black font-mono text-white mt-1">{scoreAllies}</div>
          </div>
          <div className="text-xl font-mono text-slate-500 font-bold">VS</div>
          <div className="text-center">
            <span className="text-xs font-mono font-bold text-red-400 uppercase">TIM LAWAN (ATTACKERS)</span>
            <div className="text-4xl font-black font-mono text-white mt-1">{scoreEnemies}</div>
          </div>
        </div>

        {/* Allies Table */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase">TIM KITA</span>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">OPERATIF</th>
                  <th className="py-2.5 px-2 text-center">KILL</th>
                  <th className="py-2.5 px-2 text-center">DEATH</th>
                  <th className="py-2.5 px-2 text-center">HEADSHOT</th>
                  <th className="py-2.5 px-2 text-center">PLANT/DEFUSE</th>
                  <th className="py-2.5 px-3 text-right">COMBAT SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="bg-blue-950/30 text-white font-bold">
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Anda (Pemain)</span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-emerald-400">{playerStats.kills}</td>
                  <td className="py-2.5 px-2 text-center text-red-400">{playerStats.deaths}</td>
                  <td className="py-2.5 px-2 text-center text-yellow-400">{playerStats.headshots}</td>
                  <td className="py-2.5 px-2 text-center">{playerStats.plants + playerStats.defuses}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-300 font-black">{playerStats.combatScore}</td>
                </tr>
                {allyBots.map((bot) => (
                  <tr key={bot.id} className="text-slate-300">
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{bot.name}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">1</td>
                    <td className="py-2.5 px-2 text-center">1</td>
                    <td className="py-2.5 px-2 text-center">0</td>
                    <td className="py-2.5 px-2 text-center">0</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">180</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enemies Table */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold text-red-400 uppercase">TIM LAWAN</span>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">OPERATIF</th>
                  <th className="py-2.5 px-2 text-center">KILL</th>
                  <th className="py-2.5 px-2 text-center">DEATH</th>
                  <th className="py-2.5 px-2 text-center">HEADSHOT</th>
                  <th className="py-2.5 px-2 text-center">PLANT/DEFUSE</th>
                  <th className="py-2.5 px-3 text-right">COMBAT SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {enemyBots.map((bot) => (
                  <tr key={bot.id} className="text-slate-300">
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>{bot.name}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">{bot.isAlive ? 1 : 0}</td>
                    <td className="py-2.5 px-2 text-center">{bot.isAlive ? 0 : 1}</td>
                    <td className="py-2.5 px-2 text-center">0</td>
                    <td className="py-2.5 px-2 text-center">0</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">140</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            Tutup Papan Skor [TAB]
          </button>
        </div>
      </div>
    </div>
  );
};
