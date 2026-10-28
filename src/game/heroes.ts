/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeroDef, HeroRoleId } from '../types/game';

export const HERO_REGISTRY: Record<HeroRoleId, HeroDef> = {
  assault: {
    id: 'assault',
    name: 'Vanguard',
    roleName: 'Assault / Entry Fragger',
    tagline: 'Membuka serangan garda terdepan dan memecah formasi musuh',
    color: '#ef4444',
    accentColor: '#f87171',
    description: 'Petarung agresif berkecepatan tinggi yang dirancang untuk menjadi penyerang pertama (entry fragger). Mampu bermanuver cepat dan membutakan lawan.',
    passiveDesc: 'Adrenaline Rush: Kecepatan reload meningkat 25% sesaat setelah menumbangkan musuh.',
    skillQ: {
      name: 'Flash Surge (Granat Kebutaan)',
      description: 'Melempar granat cahaya kejut yang membutakan penglihatan musuh selama 2.8 detik.',
      cooldownSec: 12,
      icon: 'Zap',
    },
    skillE: {
      name: 'Tactical Dash (Maju Kilat)',
      description: 'Melesat maju seketika ke arah gerakan untuk merebut sudut strategis atau menghindari baku tembak.',
      cooldownSec: 8,
      icon: 'FastForward',
    },
  },
  sentinel: {
    id: 'sentinel',
    name: 'Aegis',
    roleName: 'Sentinel / Tank',
    tagline: 'Memperkuat pertahanan site bom dan mengendalikan alur serang musuh',
    color: '#06b6d4',
    accentColor: '#38bdf8',
    description: 'Benteng pertahanan tim yang unggul dalam mengamankan area objektif (site A/B), menahan dorongan musuh, dan memblokir garis pandang tembakan.',
    passiveDesc: 'Reinforced Plating: Mengurangi kerusakan ledakan sebesar 20% dan tahan terhadap efek knockback.',
    skillQ: {
      name: 'Solid Barrier (Dinding Energi)',
      description: 'Mendirikan barikade perisai berdaya tahan 450 HP untuk perlindungan tim dari tembakan jarak jauh.',
      cooldownSec: 16,
      icon: 'Shield',
    },
    skillE: {
      name: 'Nanite Smoke (Asap Taktis)',
      description: 'Menyebarkan kepulan asap tebal pekat yang menutupi garis tembak sniper musuh selama 12 detik.',
      cooldownSec: 14,
      icon: 'Cloud',
    },
  },
  recon: {
    id: 'recon',
    name: 'Phantom',
    roleName: 'Recon / Scout Sniper',
    tagline: 'Mengumpulkan informasi intel dan mendominasi duel jarak jauh',
    color: '#a855f7',
    accentColor: '#c084fc',
    description: 'Spesialis pengintai yang mengungkap persembunyian musuh melalui sonar taktis dan memberikan eliminasi presisi dari jarak jauh.',
    passiveDesc: 'Thermal Vision: Saat membidik dengan scope (ADS), musuh yang terlihat tampak dengan kontras tinggi.',
    skillQ: {
      name: 'Sonar Pulse (Sensor Radar)',
      description: 'Menembakkan pulsa sonar yang menandai dan memperlihatkan siluet musuh di balik tembok selama 4 detik.',
      cooldownSec: 18,
      icon: 'Radar',
    },
    skillE: {
      name: 'Silent Step (Langkah Senyap)',
      description: 'Menghilangkan suara langkah kaki dan meningkatkan kecepatan gerak membidik selama 6 detik.',
      cooldownSec: 12,
      icon: 'EyeOff',
    },
  },
  support: {
    id: 'support',
    name: 'Oasis',
    roleName: 'Support / Combat Medic',
    tagline: 'Menjaga ketahanan tim dan memulihkan kondisi rekan tempur',
    color: '#10b981',
    accentColor: '#34d399',
    description: 'Dukungan vital pasukan tempur yang memulihkan HP rekan tim, mendistribusikan perisai proteksi ekstra, dan mempercepat tempo tim.',
    passiveDesc: 'Combat Triage: Meregangkan waktu darah rekan yang terluka dan mempercepat proses defuse bom sebesar 15%.',
    skillQ: {
      name: 'Biotic Field (Aura Pemulihan)',
      description: 'Menancapkan suar pemulih yang meregenerasi 35 HP/detik untuk semua rekan tim dalam radius 6 meter.',
      cooldownSec: 15,
      icon: 'HeartPulse',
    },
    skillE: {
      name: 'Armor Stim (Injeksi Perisai)',
      description: 'Memberikan tambahan 50 Armor shield instan dan meningkatkan kecepatan gerak tim selama 5 detik.',
      cooldownSec: 14,
      icon: 'ShieldAlert',
    },
  },
};
