/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GameModeId, HeroRoleId, KillFeedEntry, PlayerStats, WeaponId } from '../types/game';
import { soundFX } from './audio';
import { BotAIManager, BotOperative } from './botAI';
import { fairPlayMonitor } from './fairPlay';
import { MapBuilder, MapStructure } from './mapBuilder';
import { TacticalPingManager } from './pingSystem';
import { WEAPON_REGISTRY } from './weapons';

export interface FloatingDamageNumber {
  id: string;
  text: string;
  isHeadshot: boolean;
  position: THREE.Vector3;
  opacity: number;
  createdAt: number;
}

export class TacticalGameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Systems
  public mapStructure!: MapStructure;
  public botAI!: BotAIManager;
  public pingManager!: TacticalPingManager;

  // Player State
  public health: number = 100;
  public maxHealth: number = 100;
  public armor: number = 50;
  public maxArmor: number = 50;
  public isAlive: boolean = true;
  public currentWeaponId: WeaponId = 'vk47';
  public currentHeroRole: HeroRoleId = 'assault';
  public currentMode: GameModeId = 'bomb_defusal';

  // Weapon Ammo
  public ammoInMag: number = 30;
  public reserveAmmo: number = 120;
  public isReloading: boolean = false;
  public reloadProgress: number = 0;
  public lastShotTime: number = 0;
  public shotsFiredInBurst: number = 0;

  // Recoil State
  public currentRecoilPitch: number = 0;
  public currentRecoilYaw: number = 0;
  public crosshairBloom: number = 1.0;

  // Movement State
  public position: THREE.Vector3 = new THREE.Vector3(0, 1.7, 30);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isGrounded: boolean = true;
  public isSprinting: boolean = false;
  public isCrouching: boolean = false;
  public isSliding: boolean = false;
  public slideTimer: number = 0;
  public slideVelocity: THREE.Vector3 = new THREE.Vector3();
  public isADS: boolean = false; // Aim down sights

  // Camera angles (Euler)
  public pitch: number = 0; // vertical (clamped)
  public yaw: number = 0;   // horizontal

  // Hero Ability Cooldowns (ms remaining)
  public cooldownQMs: number = 0;
  public cooldownEMs: number = 0;

  // Bomb Defusal State
  public bombPlanted: boolean = false;
  public bombPlantTimer: number = 0; // 45s countdown
  public bombSite: 'A' | 'B' | null = null;
  public bombPosition: THREE.Vector3 = new THREE.Vector3();
  public isPlantingBomb: boolean = false;
  public plantProgress: number = 0;
  public isDefusingBomb: boolean = false;
  public defuseProgress: number = 0;
  public roundTimeSeconds: number = 100;
  public scoreAllies: number = 0;
  public scoreEnemies: number = 0;

  // Hitmarker & HUD notifications
  public hitmarkerActive: boolean = false;
  public hitmarkerIsHeadshot: boolean = false;
  public hitmarkerTimer: number = 0;
  public floatingDamages: FloatingDamageNumber[] = [];
  public killFeed: KillFeedEntry[] = [];
  public stats: PlayerStats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    headshots: 0,
    damageDealt: 0,
    plants: 0,
    defuses: 0,
    combatScore: 0,
  };

  // Tracers & FX in 3D
  private tracers: { line: THREE.Line; createdAt: number }[] = [];
  private bulletHoles: THREE.Mesh[] = [];

  // Keys Map
  public keys: Record<string, boolean> = {};

  // Raycaster for shooting & obstacle collision
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0f19);
    this.scene.fog = new THREE.FogExp2(0x0b0f19, 0.015);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 1.7, 30);

    const isSoftwareGl = (() => {
      const gl = canvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
    this.initSystems();
  }

  private setupLighting() {
    // 3-Point Lighting Rig with Warm/Cool temperature per Three.js directives
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 1.2);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    keyLight.position.set(20, 35, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 120;
    const d = 35;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-20, 25, -20);
    this.scene.add(rimLight);
  }

  public initSystems() {
    // Clear existing
    if (this.mapStructure) this.scene.remove(this.mapStructure.group);
    if (this.botAI) this.botAI.clearAll();
    if (this.pingManager) this.pingManager.clearAll();

    // Map Build
    this.mapStructure = MapBuilder.buildMap(this.currentMode);
    this.scene.add(this.mapStructure.group);

    // Systems
    this.botAI = new BotAIManager(this.scene);
    this.pingManager = new TacticalPingManager(this.scene);

    // Set player spawn
    this.position.copy(this.mapStructure.spawnAttackers);
    this.position.y = 1.7;
    this.yaw = Math.PI; // Face north
    this.pitch = 0;

    // Reset weapons & ammo
    const weapon = WEAPON_REGISTRY[this.currentWeaponId];
    this.ammoInMag = weapon.magSize;
    this.reserveAmmo = weapon.reserveAmmo;
    this.health = 100;
    this.armor = 50;
    this.isAlive = true;

    // Spawn operatives according to mode
    if (this.currentMode === 'bomb_defusal') {
      this.roundTimeSeconds = 100;
      this.bombPlanted = false;
      this.bombPlantTimer = 0;

      // 2 Friendly Operatives
      this.botAI.spawnBot('Viper (Rekan)', 'allies', 'sentinel', new THREE.Vector3(-4, 0, 32), 'vk47');
      this.botAI.spawnBot('Ghost (Rekan)', 'allies', 'recon', new THREE.Vector3(4, 0, 32), 'spectre9');

      // 3 Enemy Defenders
      this.botAI.spawnBot('Apex Hunter', 'enemies', 'assault', new THREE.Vector3(-20, 1.2, -18), 'vk47');
      this.botAI.spawnBot('Titan Defender', 'enemies', 'sentinel', new THREE.Vector3(22, 0, 18), 'aegis_shotgun');
      this.botAI.spawnBot('Shadow Scout', 'enemies', 'recon', new THREE.Vector3(0, 0, -20), 'apex_longbow');
    } else if (this.currentMode === 'tdm') {
      this.roundTimeSeconds = 180;
      // 3 Allies, 4 Enemies for high-octane team deathmatch
      this.botAI.spawnBot('Echo-1', 'allies', 'assault', new THREE.Vector3(-6, 0, 25), 'vk47');
      this.botAI.spawnBot('Echo-2', 'allies', 'support', new THREE.Vector3(6, 0, 25), 'spectre9');

      this.botAI.spawnBot('Raven-1', 'enemies', 'assault', new THREE.Vector3(-15, 0, -10), 'vk47');
      this.botAI.spawnBot('Raven-2', 'enemies', 'recon', new THREE.Vector3(15, 0, -10), 'apex_longbow');
      this.botAI.spawnBot('Raven-3', 'enemies', 'sentinel', new THREE.Vector3(0, 0, -15), 'spectre9');
    }
  }

  // Handle Mouse Look
  public onMouseMove(dx: number, dy: number, sensitivity: number = 0.0022) {
    if (!this.isAlive) return;

    // Record telemetry for Fair Play Anti-Cheat
    fairPlayMonitor.recordMouseMovement(dx, dy);

    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;

    // Clamp pitch between -85 and +85 degrees
    const maxPitch = (Math.PI / 2) - 0.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    // Player pulling mouse down physically compensates recoil
    if (dy > 0 && this.currentRecoilPitch > 0) {
      const compensated = dy * sensitivity * 0.8;
      this.currentRecoilPitch = Math.max(0, this.currentRecoilPitch - compensated);
      fairPlayMonitor.recordShotRecoilCompensation(compensated);
    }
  }

  // Shoot Weapon
  public shoot() {
    if (!this.isAlive || this.isReloading) return;
    if (this.ammoInMag <= 0) {
      this.reload();
      return;
    }

    const now = performance.now();
    const weapon = WEAPON_REGISTRY[this.currentWeaponId];
    const shotInterval = (60 / weapon.fireRateRPM) * 1000;

    if (now - this.lastShotTime < shotInterval) return;
    this.lastShotTime = now;
    this.ammoInMag--;
    this.shotsFiredInBurst++;

    // 1. Play Procedural Audio
    soundFX.playGunshot(weapon.category.toLowerCase() as 'rifle');

    // 2. Apply Recoil Impulse (Vertical Kick + Horizontal Sway Pattern)
    const patternIdx = Math.min(this.shotsFiredInBurst, weapon.recoilPattern.length - 1);
    const patternKick = weapon.recoilPattern[patternIdx];
    this.currentRecoilPitch += patternKick.y * (this.isADS ? 0.6 : 1.0);
    this.currentRecoilYaw += patternKick.x * (this.isADS ? 0.5 : 1.0);

    // Expand crosshair bloom
    this.crosshairBloom = Math.min(2.5, this.crosshairBloom + 0.35);

    // 3. Calculate Bullet Ray Vector with Recoil and Spread
    let spreadAngle = weapon.hipfireSpread;
    if (this.isADS) spreadAngle *= 0.25;
    if (this.isCrouching) spreadAngle *= 0.65;
    if (this.isSliding) spreadAngle *= 1.35;
    if (!this.isGrounded) spreadAngle *= 2.2;

    const spreadX = (Math.random() - 0.5) * spreadAngle;
    const spreadY = (Math.random() - 0.5) * spreadAngle;

    // Direction vector combining camera look + current recoil
    const effectivePitch = this.pitch + this.currentRecoilPitch;
    const effectiveYaw = this.yaw + this.currentRecoilYaw;

    const shootDir = new THREE.Vector3(
      -Math.sin(effectiveYaw + spreadX) * Math.cos(effectivePitch + spreadY),
      Math.sin(effectivePitch + spreadY),
      -Math.cos(effectiveYaw + spreadX) * Math.cos(effectivePitch + spreadY)
    ).normalize();

    // Raycast from camera
    this.raycaster.set(this.camera.position, shootDir);
    this.raycaster.far = 150;

    // Collect all collidable meshes
    const botMeshes: THREE.Mesh[] = [];
    this.botAI.bots
      .filter((b) => b.isAlive && b.team === 'enemies')
      .forEach((b) => {
        botMeshes.push(b.headMesh, b.bodyMesh, b.legsMesh);
      });

    const obstacleMeshes: THREE.Object3D[] = this.mapStructure.obstacles.map((o) => o.mesh);
    const intersects = this.raycaster.intersectObjects([...botMeshes, ...obstacleMeshes], true);

    let hitPoint = this.camera.position.clone().add(shootDir.clone().multiplyScalar(60));

    if (intersects.length > 0) {
      const firstHit = intersects[0];
      hitPoint = firstHit.point;

      // Check if bot was hit
      let hitMesh: THREE.Object3D | null = firstHit.object;
      while (hitMesh && !hitMesh.userData?.botRef && hitMesh.parent) {
        if (hitMesh.userData?.isBotHead || hitMesh.userData?.isBotBody || hitMesh.userData?.isBotLimb) break;
        hitMesh = hitMesh.parent;
      }

      if (hitMesh && hitMesh.userData?.botRef) {
        const bot: BotOperative = hitMesh.userData.botRef;
        const isHead = hitMesh.userData.isBotHead === true;
        const isLimb = hitMesh.userData.isBotLimb === true;

        let baseDmg = weapon.damageBody;
        if (isHead) baseDmg = weapon.damageHead;
        else if (isLimb) baseDmg = weapon.damageLimb;

        // Apply damage to bot
        const res = this.botAI.applyDamage(bot, baseDmg, isHead);
        this.stats.damageDealt += res.actualDmg;
        this.stats.combatScore += res.actualDmg;

        // Hitmarker notification
        this.hitmarkerActive = true;
        this.hitmarkerIsHeadshot = isHead;
        this.hitmarkerTimer = 0.22;

        if (isHead) {
          soundFX.playHeadshotHit();
          this.stats.headshots++;
        } else {
          soundFX.playBodyHit();
        }

        // Spawn 3D floating damage number
        this.floatingDamages.push({
          id: Math.random().toString(),
          text: `${res.actualDmg}${isHead ? ' CRIT!' : ''}`,
          isHeadshot: isHead,
          position: hitPoint.clone().add(new THREE.Vector3(0, 0.4, 0)),
          opacity: 1.0,
          createdAt: performance.now(),
        });

        // Kill check
        if (res.isKilled) {
          this.stats.kills++;
          this.stats.combatScore += 300;
          this.scoreAllies++;
          soundFX.playKillConfirm();

          this.killFeed.unshift({
            id: Math.random().toString(),
            killerName: 'Anda',
            killerRole: this.currentHeroRole,
            victimName: bot.name,
            victimRole: bot.role,
            weaponName: weapon.name,
            isHeadshot: isHead,
            time: performance.now(),
          });
          if (this.killFeed.length > 5) this.killFeed.pop();
        }
      } else {
        // Wall Hit: Create small glowing bullet decal
        this.createBulletHole(firstHit.point, firstHit.face?.normal);
      }
    }

    // 4. Create visual bullet tracer line
    this.createTracer(this.camera.position, hitPoint);
  }

  private createTracer(start: THREE.Vector3, end: THREE.Vector3) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      start.clone().add(new THREE.Vector3(0.2, -0.2, 0)),
      end,
    ]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.85,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({ line, createdAt: performance.now() });
  }

  private createBulletHole(point: THREE.Vector3, normal?: THREE.Vector3) {
    const holeGeo = new THREE.CircleGeometry(0.04, 8);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.copy(point);
    if (normal) {
      hole.position.add(normal.clone().multiplyScalar(0.01));
      hole.lookAt(point.clone().add(normal));
    }
    this.scene.add(hole);
    this.bulletHoles.push(hole);
    if (this.bulletHoles.length > 30) {
      const old = this.bulletHoles.shift();
      if (old) this.scene.remove(old);
    }
  }

  // Reload action
  public reload() {
    const weapon = WEAPON_REGISTRY[this.currentWeaponId];
    if (this.isReloading || this.ammoInMag === weapon.magSize || this.reserveAmmo <= 0) return;

    this.isReloading = true;
    this.reloadProgress = 0;
    soundFX.playReload();

    const reloadDurationMs = weapon.reloadTimeSec * 1000;
    const start = performance.now();

    const checkReload = () => {
      const elapsed = performance.now() - start;
      this.reloadProgress = Math.min(1.0, elapsed / reloadDurationMs);

      if (elapsed >= reloadDurationMs) {
        const needed = weapon.magSize - this.ammoInMag;
        const toLoad = Math.min(needed, this.reserveAmmo);
        this.ammoInMag += toLoad;
        this.reserveAmmo -= toLoad;
        this.isReloading = false;
        this.reloadProgress = 0;
      } else {
        requestAnimationFrame(checkReload);
      }
    };
    requestAnimationFrame(checkReload);
  }

  // Hero Ability 1 (Q)
  public castSkillQ() {
    if (this.cooldownQMs > 0 || !this.isAlive) return;

    if (this.currentHeroRole === 'assault') {
      // Flash Surge: Blinds enemies within forward FOV
      soundFX.playAbilityCast('flash');
      this.cooldownQMs = 12000;
      this.botAI.bots.forEach((b) => {
        if (b.team === 'enemies' && b.position.distanceTo(this.position) < 30) {
          b.reactionTimer = 2.8; // Blind delay
        }
      });
    } else if (this.currentHeroRole === 'sentinel') {
      // Solid Barrier
      soundFX.playAbilityCast('barrier');
      this.cooldownQMs = 16000;
      // Spawn temporary barrier shield
      const barGeo = new THREE.BoxGeometry(4, 2.2, 0.4);
      const barMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.7,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.4,
      });
      const barrier = new THREE.Mesh(barGeo, barMat);
      barrier.position.copy(this.position).add(this.getForwardVector().multiplyScalar(2.5));
      barrier.position.y = 1.1;
      barrier.rotation.y = this.yaw;
      this.scene.add(barrier);
      this.mapStructure.obstacles.push({
        mesh: barrier,
        box: new THREE.Box3().setFromObject(barrier),
        isCover: true,
      });
      setTimeout(() => this.scene.remove(barrier), 10000);
    } else if (this.currentHeroRole === 'recon') {
      // Sonar Pulse
      soundFX.playAbilityCast('sonar');
      this.cooldownQMs = 18000;
    } else if (this.currentHeroRole === 'support') {
      // Biotic Healing Field
      soundFX.playAbilityCast('heal');
      this.cooldownQMs = 15000;
      this.health = Math.min(this.maxHealth, this.health + 45);
    }
  }

  // Hero Ability 2 (E)
  public castSkillE() {
    if (this.cooldownEMs > 0 || !this.isAlive) return;

    if (this.currentHeroRole === 'assault') {
      // Tactical Dash: Sudden forward burst
      soundFX.playAbilityCast('dash');
      this.cooldownEMs = 8000;
      const fwd = this.getForwardVector();
      this.velocity.add(fwd.multiplyScalar(18));
    } else if (this.currentHeroRole === 'sentinel') {
      // Nanite Smoke
      soundFX.playAbilityCast('smoke');
      this.cooldownEMs = 14000;
      const smokeGeo = new THREE.SphereGeometry(4.5, 16, 16);
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const smoke = new THREE.Mesh(smokeGeo, smokeMat);
      smoke.position.copy(this.position).add(this.getForwardVector().multiplyScalar(3));
      smoke.position.y = 2.0;
      this.scene.add(smoke);
      setTimeout(() => this.scene.remove(smoke), 8000);
    } else if (this.currentHeroRole === 'recon') {
      // Silent Step
      this.cooldownEMs = 12000;
    } else if (this.currentHeroRole === 'support') {
      // Armor Stim
      this.cooldownEMs = 14000;
      this.armor = Math.min(this.maxArmor, this.armor + 50);
    }
  }

  // Bomb Actions
  public interactWithBomb() {
    if (this.currentMode !== 'bomb_defusal' || !this.isAlive) return;

    // Check distance to Site A or B
    const distA = this.position.distanceTo(this.mapStructure.siteAPosition);
    const distB = this.position.distanceTo(this.mapStructure.siteBPosition);

    if (!this.bombPlanted) {
      // Attempt plant
      if (distA < 6 || distB < 6) {
        this.isPlantingBomb = true;
        this.plantProgress += 0.025;
        soundFX.playBombTick();

        if (this.plantProgress >= 1.0) {
          this.bombPlanted = true;
          this.isPlantingBomb = false;
          this.plantProgress = 0;
          this.bombSite = distA < 6 ? 'A' : 'B';
          this.bombPosition.copy(this.position);
          this.bombPosition.y = 0.2;
          this.bombPlantTimer = 45;
          this.stats.plants++;
          this.stats.combatScore += 200;

          // Spawn visible 3D bomb spike model
          const bombGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.6, 8);
          const bombMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xef4444,
            emissiveIntensity: 0.8,
            metalness: 0.9,
          });
          const bombMesh = new THREE.Mesh(bombGeo, bombMat);
          bombMesh.position.copy(this.bombPosition);
          this.scene.add(bombMesh);
        }
      }
    } else {
      // Attempt defuse
      const distToBomb = this.position.distanceTo(this.bombPosition);
      if (distToBomb < 4.0) {
        this.isDefusingBomb = true;
        this.defuseProgress += 0.015;
        soundFX.playBombTick(true);

        if (this.defuseProgress >= 1.0) {
          this.bombPlanted = false;
          this.isDefusingBomb = false;
          this.defuseProgress = 0;
          this.stats.defuses++;
          this.stats.combatScore += 300;
          this.scoreAllies++;
        }
      }
    }
  }

  public stopBombInteraction() {
    this.isPlantingBomb = false;
    this.isDefusingBomb = false;
  }

  public takeDamage(dmg: number) {
    if (!this.isAlive) return;

    let remaining = dmg;
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, Math.floor(dmg * 0.66));
      this.armor -= absorbed;
      remaining -= absorbed;
      if (this.armor <= 0) soundFX.playShieldBreak();
    }

    this.health = Math.max(0, this.health - remaining);
    soundFX.playBodyHit();

    if (this.health <= 0) {
      this.isAlive = false;
      this.stats.deaths++;
      this.scoreEnemies++;
      this.health = 0;
    }
  }

  // Update loop
  public update(delta: number) {
    const clampedDelta = Math.min(delta, 0.1);

    // 1. Ability Cooldowns
    if (this.cooldownQMs > 0) this.cooldownQMs = Math.max(0, this.cooldownQMs - clampedDelta * 1000);
    if (this.cooldownEMs > 0) this.cooldownEMs = Math.max(0, this.cooldownEMs - clampedDelta * 1000);

    // 2. Hitmarker Decay
    if (this.hitmarkerActive) {
      this.hitmarkerTimer -= clampedDelta;
      if (this.hitmarkerTimer <= 0) this.hitmarkerActive = false;
    }

    // 3. Floating 3D Damage Numbers
    for (let i = this.floatingDamages.length - 1; i >= 0; i--) {
      const item = this.floatingDamages[i];
      item.position.y += clampedDelta * 1.2;
      item.opacity -= clampedDelta * 0.9;
      if (item.opacity <= 0) this.floatingDamages.splice(i, 1);
    }

    // 4. Tracers decay
    const now = performance.now();
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      if (now - this.tracers[i].createdAt > 80) {
        this.scene.remove(this.tracers[i].line);
        this.tracers.splice(i, 1);
      }
    }

    // 5. Recoil Recovery
    const weapon = WEAPON_REGISTRY[this.currentWeaponId];
    if (now - this.lastShotTime > 140) {
      this.shotsFiredInBurst = 0;
      this.currentRecoilPitch = Math.max(0, this.currentRecoilPitch - clampedDelta * weapon.recoilRecoveryRate * 0.05);
      this.currentRecoilYaw *= 0.85;
      this.crosshairBloom = Math.max(1.0, this.crosshairBloom - clampedDelta * 3.5);
    }

    // 6. Bomb Defusal Timer
    if (this.bombPlanted && this.bombPlantTimer > 0) {
      this.bombPlantTimer -= clampedDelta;
      if (this.bombPlantTimer <= 0) {
        // Bomb detonates! Attackers win
        this.bombPlanted = false;
        this.scoreEnemies++;
      }
    }

    // 7. Movement Kinematics (Slide, Jump, Sprint, Air Strafe)
    if (this.isAlive) {
      this.updateMovement(clampedDelta);
    }

    // 8. Update Camera & Viewport
    const cameraHeight = this.isSliding ? 0.95 : this.isCrouching ? 1.15 : 1.7;
    this.camera.position.set(this.position.x, this.position.y - (1.7 - cameraHeight), this.position.z);

    const targetFov = this.isADS ? weapon.adsFov : 75;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 12, clampedDelta);
    this.camera.updateProjectionMatrix();

    // Camera Rotation
    const finalPitch = this.pitch + this.currentRecoilPitch;
    const finalYaw = this.yaw + this.currentRecoilYaw;
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.x = finalPitch;
    this.camera.rotation.y = finalYaw;

    // 9. Update Bot AI & Pings
    this.botAI.update(clampedDelta, this.position, (bot, dmg) => {
      this.takeDamage(dmg);
    });
    this.pingManager.update(clampedDelta);

    // 10. Render Frame
    this.renderer.render(this.scene, this.camera);
  }

  private updateMovement(delta: number) {
    const weapon = WEAPON_REGISTRY[this.currentWeaponId];
    let baseSpeed = 6.2; // Base run speed m/s

    if (this.isSprinting) baseSpeed = 9.4; // Sprint
    if (this.isCrouching) baseSpeed = 3.6; // Crouch
    if (this.isADS) baseSpeed *= weapon.adsMoveSpeedMultiplier;

    // Direction vector from keys
    const fwd = this.getForwardVector();
    const right = this.getRightVector();
    const moveDir = new THREE.Vector3();

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.add(fwd);
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.sub(fwd);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.add(right);
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.sub(right);

    if (moveDir.lengthSq() > 0) moveDir.normalize();

    // Slide Mechanics: Trigger slide when sprinting and pressing crouch
    const wantsCrouch = this.keys['KeyC'] || this.keys['ControlLeft'];
    if (wantsCrouch && this.isSprinting && this.isGrounded && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.85; // 0.85s slide duration
      this.slideVelocity.copy(fwd).multiplyScalar(13.5); // High momentum burst
      soundFX.playSlide();
    }

    if (this.isSliding) {
      this.slideTimer -= delta;
      // Exponential friction decay
      this.slideVelocity.multiplyScalar(Math.pow(0.2, delta));
      this.velocity.x = this.slideVelocity.x;
      this.velocity.z = this.slideVelocity.z;

      if (this.slideTimer <= 0 || !wantsCrouch) {
        this.isSliding = false;
      }
    } else {
      // Normal grounded or air movement
      const targetVel = moveDir.multiplyScalar(baseSpeed);
      const accel = this.isGrounded ? 18 : 6; // Snappy acceleration
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, targetVel.x, accel, delta);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, targetVel.z, accel, delta);
    }

    // Jump (Space)
    if (this.keys['Space'] && this.isGrounded) {
      this.velocity.y = 7.5; // Jump impulse
      this.isGrounded = false;
      soundFX.playJump();
    }

    // Gravity
    this.velocity.y -= 22 * delta;

    // Apply movement & obstacle collision
    const nextPos = this.position.clone().add(this.velocity.clone().multiplyScalar(delta));

    // Ground check
    if (nextPos.y <= 1.7) {
      nextPos.y = 1.7;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Horizontal obstacle collisions
    const playerRadius = 0.45;
    for (const obstacle of this.mapStructure.obstacles) {
      const box = obstacle.box;
      if (
        nextPos.x + playerRadius > box.min.x &&
        nextPos.x - playerRadius < box.max.x &&
        nextPos.z + playerRadius > box.min.z &&
        nextPos.z - playerRadius < box.max.z &&
        nextPos.y - 1.5 < box.max.y
      ) {
        // Simple slide response along collision normal
        this.velocity.x *= 0.2;
        this.velocity.z *= 0.2;
        return; // Halt penetration
      }
    }

    this.position.copy(nextPos);
  }

  public getForwardVector(): THREE.Vector3 {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
  }

  public getRightVector(): THREE.Vector3 {
    return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
  }

  public switchWeapon(id: WeaponId) {
    if (this.currentWeaponId === id) return;
    this.currentWeaponId = id;
    const def = WEAPON_REGISTRY[id];
    this.ammoInMag = def.magSize;
    this.reserveAmmo = def.reserveAmmo;
    this.isReloading = false;
    this.isADS = false;
    soundFX.playReload();
  }

  public switchHero(role: HeroRoleId) {
    this.currentHeroRole = role;
    this.cooldownQMs = 0;
    this.cooldownEMs = 0;
  }

  public switchMode(mode: GameModeId) {
    this.currentMode = mode;
    this.initSystems();
  }

  public sendTacticalPing(type: 'danger' | 'defend' | 'push' | 'help' | 'loot') {
    // Raycast forward to find spatial surface for ping
    this.raycaster.set(this.camera.position, this.camera.getWorldDirection(new THREE.Vector3()));
    const intersects = this.raycaster.intersectObjects(
      this.mapStructure.obstacles.map((o) => o.mesh),
      true
    );

    let pingPos = this.position.clone().add(this.getForwardVector().multiplyScalar(15));
    if (intersects.length > 0) {
      pingPos = intersects[0].point;
    }

    this.pingManager.createPing(type, pingPos, 'Anda');
    this.botAI.respondToPlayerPing(type, pingPos);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
