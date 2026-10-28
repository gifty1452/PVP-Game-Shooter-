/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { HeroRoleId, WeaponId } from '../types/game';
import { WEAPON_REGISTRY } from './weapons';
import { soundFX } from './audio';

export interface BotOperative {
  id: string;
  name: string;
  team: 'allies' | 'enemies';
  role: HeroRoleId;
  weaponId: WeaponId;
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  isAlive: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  rotationY: number;
  meshGroup: THREE.Group;
  headMesh: THREE.Mesh;
  bodyMesh: THREE.Mesh;
  legsMesh: THREE.Mesh;
  state: 'patrol' | 'holding_angle' | 'engaging' | 'planting' | 'defusing' | 'flanking';
  lastShotTime: number;
  burstCount: number;
  burstMax: number;
  reactionTimer: number;
  radioLog?: string;
}

export class BotAIManager {
  public bots: BotOperative[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Create composite 3-8 part tactical operative character model (conforming to Three.js guidelines)
  private createBotMesh(team: 'allies' | 'enemies', role: HeroRoleId): {
    group: THREE.Group;
    head: THREE.Mesh;
    body: THREE.Mesh;
    legs: THREE.Mesh;
  } {
    const group = new THREE.Group();
    const isAlly = team === 'allies';
    const mainColor = isAlly ? 0x2563eb : 0xdc2626;
    const armorColor = 0x1e293b;
    const visorColor = isAlly ? 0x38bdf8 : 0xf87171;

    const armorMat = new THREE.MeshStandardMaterial({
      color: armorColor,
      roughness: 0.5,
      metalness: 0.5,
    });
    const suitMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.7,
      metalness: 0.2,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: visorColor,
      emissive: visorColor,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });

    // 1. Torso / Body (chest armor plate)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.8, 0.45);
    const body = new THREE.Mesh(torsoGeo, suitMat);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    const chestPlateGeo = new THREE.BoxGeometry(0.74, 0.5, 0.48);
    const chestPlate = new THREE.Mesh(chestPlateGeo, armorMat);
    chestPlate.position.y = 1.35;
    group.add(chestPlate);

    // 2. Head with tactical visor (CRITICAL HITBOX)
    const headGeo = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const head = new THREE.Mesh(headGeo, armorMat);
    head.position.y = 1.95;
    head.castShadow = true;
    group.add(head);

    // Visor strip
    const visorGeo = new THREE.BoxGeometry(0.34, 0.12, 0.1);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.96, -0.2);
    group.add(visor);

    // 3. Legs
    const legsGeo = new THREE.BoxGeometry(0.6, 0.9, 0.35);
    const legs = new THREE.Mesh(legsGeo, armorMat);
    legs.position.y = 0.45;
    legs.castShadow = true;
    group.add(legs);

    // 4. Weapon model in hands
    const gunGeo = new THREE.BoxGeometry(0.12, 0.15, 0.7);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.8, roughness: 0.2 });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.32, 1.25, -0.45);
    gun.castShadow = true;
    group.add(gun);

    // Attach identification metadata
    head.userData = { isBotHead: true };
    body.userData = { isBotBody: true };
    legs.userData = { isBotLimb: true };

    return { group, head, body, legs };
  }

  public spawnBot(
    name: string,
    team: 'allies' | 'enemies',
    role: HeroRoleId,
    pos: THREE.Vector3,
    weaponId: WeaponId = 'vk47'
  ): BotOperative {
    const { group, head, body, legs } = this.createBotMesh(team, role);
    group.position.copy(pos);
    this.scene.add(group);

    const bot: BotOperative = {
      id: 'bot_' + Math.random().toString(36).substring(2, 8),
      name,
      team,
      role,
      weaponId,
      health: 100,
      maxHealth: 100,
      armor: 50,
      maxArmor: 50,
      isAlive: true,
      position: pos.clone(),
      velocity: new THREE.Vector3(),
      targetPosition: pos.clone(),
      rotationY: 0,
      meshGroup: group,
      headMesh: head,
      bodyMesh: body,
      legsMesh: legs,
      state: 'patrol',
      lastShotTime: 0,
      burstCount: 0,
      burstMax: Math.floor(Math.random() * 3) + 3,
      reactionTimer: 0.25, // 250ms human delay
    };

    head.userData.botRef = bot;
    body.userData.botRef = bot;
    legs.userData.botRef = bot;

    this.bots.push(bot);
    return bot;
  }

  public respondToPlayerPing(type: string, pingPos: THREE.Vector3) {
    this.bots
      .filter((b) => b.team === 'allies' && b.isAlive)
      .forEach((ally) => {
        if (type === 'push') {
          ally.targetPosition.copy(pingPos);
          ally.state = 'engaging';
          ally.radioLog = `${ally.name}: "Menerima panggilan! Kami bergerak maju ke posisi ping!"`;
        } else if (type === 'defend') {
          ally.targetPosition.copy(pingPos);
          ally.state = 'holding_angle';
          ally.radioLog = `${ally.name}: "Roger, mengamankan sektor perimeter!"`;
        } else if (type === 'danger') {
          ally.targetPosition.copy(pingPos);
          ally.radioLog = `${ally.name}: "Musuh terkonfirmasi, bersiap baku tembak!"`;
        }
      });
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    onBotFireAtPlayer: (bot: BotOperative, damage: number) => void
  ) {
    const now = performance.now();

    for (const bot of this.bots) {
      if (!bot.isAlive) continue;

      // 1. Enemy AI targeting logic
      if (bot.team === 'enemies') {
        const distToPlayer = bot.position.distanceTo(playerPos);

        // Sight check & Engagement
        if (distToPlayer < 45) {
          bot.state = 'engaging';
          // Rotate towards player
          const dx = playerPos.x - bot.position.x;
          const dz = playerPos.z - bot.position.z;
          bot.rotationY = Math.atan2(dx, dz) + Math.PI;
          bot.meshGroup.rotation.y = bot.rotationY;

          // Strafe movement while engaging (tactical combat movement)
          const strafeSpeed = 2.2;
          const perpAngle = bot.rotationY + Math.PI / 2;
          const strafeX = Math.sin(perpAngle) * Math.sin(now * 0.003) * strafeSpeed * delta;
          const strafeZ = Math.cos(perpAngle) * Math.sin(now * 0.003) * strafeSpeed * delta;
          bot.position.x += strafeX;
          bot.position.z += strafeZ;

          // Shooting cycle (3-round burst simulation)
          const weapon = WEAPON_REGISTRY[bot.weaponId] || WEAPON_REGISTRY.vk47;
          const shotCooldown = (60 / weapon.fireRateRPM) * 1000;

          if (now - bot.lastShotTime > shotCooldown && distToPlayer < 35) {
            bot.lastShotTime = now;
            bot.burstCount++;

            // Bot accuracy curve (aim spread increases with distance, not instant aimbot)
            const hitChance = Math.max(0.18, 0.6 - distToPlayer * 0.012);
            const isHit = Math.random() < hitChance;

            // Audio for bot weapon
            soundFX.playGunshot(weapon.category.toLowerCase() as 'rifle');

            if (isHit) {
              const isHead = Math.random() < 0.18; // 18% bot headshot rate
              const dmg = isHead ? weapon.damageHead * 0.7 : weapon.damageBody * 0.7; // slight scaling for playability
              onBotFireAtPlayer(bot, Math.round(dmg));
            }

            if (bot.burstCount >= bot.burstMax) {
              bot.burstCount = 0;
              bot.lastShotTime = now + 650; // burst pause
            }
          }
        } else {
          // Patrol towards center
          bot.state = 'patrol';
          bot.position.lerp(playerPos, delta * 0.15);
        }
      } else {
        // Ally AI behavior
        const distToPlayer = bot.position.distanceTo(playerPos);
        if (distToPlayer > 12) {
          // Follow player loosely in formation
          bot.position.lerp(playerPos, delta * 0.4);
          bot.meshGroup.lookAt(playerPos.x, bot.position.y, playerPos.z);
        }
      }

      // Sync visual mesh
      bot.meshGroup.position.copy(bot.position);
    }
  }

  public applyDamage(
    bot: BotOperative,
    damage: number,
    isHeadshot: boolean
  ): { isKilled: boolean; actualDmg: number } {
    if (!bot.isAlive) return { isKilled: false, actualDmg: 0 };

    let remainingDmg = damage;
    // Damage absorbs from armor first (66% absorbed by armor, 33% penetrates)
    if (bot.armor > 0) {
      const armorAbsorb = Math.min(bot.armor, Math.floor(damage * 0.66));
      bot.armor -= armorAbsorb;
      remainingDmg -= armorAbsorb;
      if (bot.armor <= 0) {
        soundFX.playShieldBreak();
      }
    }

    bot.health = Math.max(0, bot.health - remainingDmg);

    if (bot.health <= 0) {
      bot.isAlive = false;
      bot.health = 0;
      bot.armor = 0;
      // Death animation: collapse to ground
      bot.meshGroup.rotation.x = Math.PI / 2;
      bot.meshGroup.position.y = 0.2;
      return { isKilled: true, actualDmg: damage };
    }

    return { isKilled: false, actualDmg: damage };
  }

  public clearAll() {
    for (const bot of this.bots) {
      this.scene.remove(bot.meshGroup);
      bot.meshGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
    }
    this.bots = [];
  }
}
