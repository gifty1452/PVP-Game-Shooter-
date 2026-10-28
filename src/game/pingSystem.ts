/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { PingType, TacticalPing } from '../types/game';
import { soundFX } from './audio';

export interface PingVisualInstance {
  ping: TacticalPing;
  meshGroup: THREE.Group;
}

export class TacticalPingManager {
  private pings: PingVisualInstance[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createPing(
    type: PingType,
    pos: THREE.Vector3,
    senderName: string = 'Pemain (Anda)'
  ): TacticalPing {
    const labels: Record<PingType, { label: string; color: string; hex: number }> = {
      danger: { label: 'Musuh Terlihat!', color: '#ef4444', hex: 0xef4444 },
      defend: { label: 'Bertahan di Sini', color: '#06b6d4', hex: 0x06b6d4 },
      push: { label: 'Maju / Dorong!', color: '#10b981', hex: 0x10b981 },
      help: { label: 'Butuh Bantuan!', color: '#f59e0b', hex: 0xf59e0b },
      loot: { label: 'Senjata / Perlengkapan', color: '#a855f7', hex: 0xa855f7 },
    };

    const cfg = labels[type];
    const pingData: TacticalPing = {
      id: 'ping_' + Math.random().toString(36).substring(2, 9),
      type,
      position: [pos.x, pos.y, pos.z],
      label: cfg.label,
      senderName,
      color: cfg.color,
      createdAt: performance.now(),
      durationMs: 7000,
    };

    // Build 3D Holographic Beacon
    const meshGroup = new THREE.Group();
    meshGroup.position.copy(pos);

    // 1. Vertical holographic light beam
    const beamGeo = new THREE.CylinderGeometry(0.04, 0.25, 4.5, 12, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: cfg.hex,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.25;
    meshGroup.add(beam);

    // 2. Base expanding pulse ring
    const ringGeo = new THREE.RingGeometry(0.2, 0.7, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: cfg.hex,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    meshGroup.add(ring);

    // 3. Floating Diamond Marker at apex
    const diamondGeo = new THREE.OctahedronGeometry(0.35);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: cfg.hex,
      emissive: cfg.hex,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 4.6;
    meshGroup.add(diamond);

    this.scene.add(meshGroup);
    this.pings.push({ ping: pingData, meshGroup });

    // Play tactical audio cue
    soundFX.playTacticalPing(type);

    return pingData;
  }

  public update(delta: number): TacticalPing[] {
    const now = performance.now();
    const active: TacticalPing[] = [];

    for (let i = this.pings.length - 1; i >= 0; i--) {
      const item = this.pings[i];
      const elapsed = now - item.ping.createdAt;

      if (elapsed > item.ping.durationMs) {
        // Expired
        this.scene.remove(item.meshGroup);
        item.meshGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        });
        this.pings.splice(i, 1);
      } else {
        // Animate pulse
        const diamond = item.meshGroup.children[2];
        if (diamond) {
          diamond.rotation.y += delta * 2.5;
          diamond.position.y = 4.6 + Math.sin(now * 0.005) * 0.2;
        }
        active.push(item.ping);
      }
    }

    return active;
  }

  public getActivePings(): TacticalPing[] {
    return this.pings.map((p) => p.ping);
  }

  public clearAll() {
    this.pings.forEach((item) => {
      this.scene.remove(item.meshGroup);
    });
    this.pings = [];
  }
}
