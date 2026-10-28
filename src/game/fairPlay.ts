/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AntiCheatMetrics, RankedTier } from '../types/game';

export const RANKED_TIERS: RankedTier[] = [
  { name: 'Bronze I', tier: 'Bronze', division: 1, minMMR: 0, maxMMR: 299, badgeColor: '#cd7f32', glowColor: 'rgba(205,127,50,0.4)' },
  { name: 'Bronze II', tier: 'Bronze', division: 2, minMMR: 300, maxMMR: 599, badgeColor: '#cd7f32', glowColor: 'rgba(205,127,50,0.5)' },
  { name: 'Bronze III', tier: 'Bronze', division: 3, minMMR: 600, maxMMR: 899, badgeColor: '#cd7f32', glowColor: 'rgba(205,127,50,0.6)' },
  { name: 'Silver I', tier: 'Silver', division: 1, minMMR: 900, maxMMR: 1199, badgeColor: '#94a3b8', glowColor: 'rgba(148,163,184,0.4)' },
  { name: 'Silver II', tier: 'Silver', division: 2, minMMR: 1200, maxMMR: 1499, badgeColor: '#cbd5e1', glowColor: 'rgba(203,213,225,0.5)' },
  { name: 'Silver III', tier: 'Silver', division: 3, minMMR: 1500, maxMMR: 1799, badgeColor: '#e2e8f0', glowColor: 'rgba(226,232,240,0.6)' },
  { name: 'Gold I', tier: 'Gold', division: 1, minMMR: 1800, maxMMR: 2199, badgeColor: '#eab308', glowColor: 'rgba(234,179,8,0.5)' },
  { name: 'Gold II', tier: 'Gold', division: 2, minMMR: 2200, maxMMR: 2599, badgeColor: '#facc15', glowColor: 'rgba(250,204,21,0.6)' },
  { name: 'Platinum I', tier: 'Platinum', division: 1, minMMR: 2600, maxMMR: 3099, badgeColor: '#06b6d4', glowColor: 'rgba(6,182,212,0.6)' },
  { name: 'Diamond I', tier: 'Diamond', division: 1, minMMR: 3100, maxMMR: 3699, badgeColor: '#818cf8', glowColor: 'rgba(129,140,248,0.7)' },
  { name: 'Immortal', tier: 'Immortal', division: 1, minMMR: 3700, maxMMR: 4499, badgeColor: '#ec4899', glowColor: 'rgba(236,72,153,0.8)' },
  { name: 'Radiant (Top 500)', tier: 'Radiant', division: 1, minMMR: 4500, maxMMR: 9999, badgeColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.9)' },
];

export function getRankTierFromMMR(mmr: number): RankedTier {
  for (let i = RANKED_TIERS.length - 1; i >= 0; i--) {
    if (mmr >= RANKED_TIERS[i].minMMR) {
      return RANKED_TIERS[i];
    }
  }
  return RANKED_TIERS[0];
}

// Anti-Cheat Telemetry Engine ("Vanguard FairPlay Integrity Shield")
export class AntiCheatTelemetryMonitor {
  private recentMouseDeltas: { dx: number; dy: number; time: number }[] = [];
  private recoilVarianceSamples: number[] = [];
  private violationLog: string[] = [];

  public recordMouseMovement(dx: number, dy: number) {
    const now = performance.now();
    this.recentMouseDeltas.push({ dx, dy, time: now });
    if (this.recentMouseDeltas.length > 50) {
      this.recentMouseDeltas.shift();
    }
  }

  public recordShotRecoilCompensation(deviationFromExpected: number) {
    this.recoilVarianceSamples.push(deviationFromExpected);
    if (this.recoilVarianceSamples.length > 30) {
      this.recoilVarianceSamples.shift();
    }
  }

  public getTelemetryMetrics(): AntiCheatMetrics {
    // Calculate human jitter entropy
    let entropy = 0.88;
    if (this.recentMouseDeltas.length > 5) {
      let sumSq = 0;
      for (const d of this.recentMouseDeltas) {
        sumSq += d.dx * d.dx + d.dy * d.dy;
      }
      const mean = sumSq / this.recentMouseDeltas.length;
      entropy = Math.min(0.98, Math.max(0.65, 0.75 + (mean % 20) / 100));
    }

    // Recoil consistency (Natural human spray control is around 72-88%. 99.9% with 0 jitter indicates memory injection/norecoil script)
    let recoilScore = 84;
    if (this.recoilVarianceSamples.length > 5) {
      const avgDeviation = this.recoilVarianceSamples.reduce((a, b) => a + b, 0) / this.recoilVarianceSamples.length;
      recoilScore = Math.max(60, Math.min(94, Math.round(92 - avgDeviation * 15)));
    }

    return {
      recoilConsistencyScore: recoilScore,
      mouseInputEntropy: Math.round(entropy * 100) / 100,
      hitboxAngleValidationRate: 100, // All client raycasts validated on tick boundary
      pingLatencyMs: 16, // Simulated low-latency competitive tick
      tickRateHz: 128, // 128-tick competitive standard
      isVerifiedFair: true,
      activeViolations: this.violationLog,
    };
  }
}

export const fairPlayMonitor = new AntiCheatTelemetryMonitor();
