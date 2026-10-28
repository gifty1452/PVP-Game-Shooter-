/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { TacticalGameEngine } from './game/gameEngine';
import { GameModeId, HeroRoleId, PingType, WeaponId } from './types/game';
import { HUD } from './components/HUD';
import { PingWheel } from './components/PingWheel';
import { BottomDock } from './components/BottomDock';
import { WeaponBenchModal } from './components/WeaponBenchModal';
import { AntiCheatModal } from './components/AntiCheatModal';
import { ScoreboardModal } from './components/ScoreboardModal';
import { SettingsModal } from './components/SettingsModal';
import { WEAPON_REGISTRY } from './game/weapons';
import { HERO_REGISTRY } from './game/heroes';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TacticalGameEngine | null>(null);

  // Pointer Lock State
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Player & Weapon State for HUD
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [armor, setArmor] = useState(50);
  const [maxArmor, setMaxArmor] = useState(50);
  const [currentWeaponId, setCurrentWeaponId] = useState<WeaponId>('vk47');
  const [currentHeroRole, setCurrentHeroRole] = useState<HeroRoleId>('assault');
  const [currentMode, setCurrentMode] = useState<GameModeId>('bomb_defusal');

  const [ammoInMag, setAmmoInMag] = useState(30);
  const [reserveAmmo, setReserveAmmo] = useState(120);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);
  const [crosshairBloom, setCrosshairBloom] = useState(1.0);
  const [isADS, setIsADS] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);

  const [hitmarkerActive, setHitmarkerActive] = useState(false);
  const [hitmarkerIsHeadshot, setHitmarkerIsHeadshot] = useState(false);

  const [cooldownQMs, setCooldownQMs] = useState(0);
  const [cooldownEMs, setCooldownEMs] = useState(0);

  const [bombPlanted, setBombPlanted] = useState(false);
  const [bombPlantTimer, setBombPlantTimer] = useState(0);
  const [bombSite, setBombSite] = useState<'A' | 'B' | null>(null);
  const [distToSiteA, setDistToSiteA] = useState(30);
  const [distToSiteB, setDistToSiteB] = useState(30);
  const [isPlantingBomb, setIsPlantingBomb] = useState(false);
  const [plantProgress, setPlantProgress] = useState(0);
  const [isDefusingBomb, setIsDefusingBomb] = useState(false);
  const [defuseProgress, setDefuseProgress] = useState(0);

  const [scoreAllies, setScoreAllies] = useState(0);
  const [scoreEnemies, setScoreEnemies] = useState(0);
  const [roundTimeSeconds, setRoundTimeSeconds] = useState(100);

  // Settings
  const [mouseSensitivity, setMouseSensitivity] = useState(0.0022);
  const [playerMMR, setPlayerMMR] = useState(1850); // Gold I

  // Modals
  const [isPingWheelOpen, setIsPingWheelOpen] = useState(false);
  const [isWeaponBenchOpen, setIsWeaponBenchOpen] = useState(false);
  const [isAntiCheatOpen, setIsAntiCheatOpen] = useState(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mouse firing hold tracker
  const isMouseDownRef = useRef(false);

  // Initialize Game Engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new TacticalGameEngine(canvasRef.current);
    engineRef.current = engine;

    // Set initial canvas size
    const handleResize = () => {
      if (!canvasMountRef.current || !engineRef.current) return;
      const width = canvasMountRef.current.clientWidth;
      const height = canvasMountRef.current.clientHeight;
      engineRef.current.resize(width, height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (engineRef.current) {
        // Continuous firing if left mouse held
        if (isMouseDownRef.current && isPointerLocked) {
          engineRef.current.shoot();
        }

        engineRef.current.update(delta);

        // Sync State to React at 30Hz throttle
        setHealth(engineRef.current.health);
        setMaxHealth(engineRef.current.maxHealth);
        setArmor(engineRef.current.armor);
        setMaxArmor(engineRef.current.maxArmor);
        setAmmoInMag(engineRef.current.ammoInMag);
        setReserveAmmo(engineRef.current.reserveAmmo);
        setIsReloading(engineRef.current.isReloading);
        setReloadProgress(engineRef.current.reloadProgress);
        setCrosshairBloom(engineRef.current.crosshairBloom);
        setIsADS(engineRef.current.isADS);
        setIsSliding(engineRef.current.isSliding);
        setIsSprinting(engineRef.current.isSprinting);
        setIsCrouching(engineRef.current.isCrouching);
        setHitmarkerActive(engineRef.current.hitmarkerActive);
        setHitmarkerIsHeadshot(engineRef.current.hitmarkerIsHeadshot);
        setCooldownQMs(engineRef.current.cooldownQMs);
        setCooldownEMs(engineRef.current.cooldownEMs);

        setBombPlanted(engineRef.current.bombPlanted);
        setBombPlantTimer(engineRef.current.bombPlantTimer);
        setBombSite(engineRef.current.bombSite);
        setIsPlantingBomb(engineRef.current.isPlantingBomb);
        setPlantProgress(engineRef.current.plantProgress);
        setIsDefusingBomb(engineRef.current.isDefusingBomb);
        setDefuseProgress(engineRef.current.defuseProgress);
        setScoreAllies(engineRef.current.scoreAllies);
        setScoreEnemies(engineRef.current.scoreEnemies);

        if (engineRef.current.mapStructure) {
          setDistToSiteA(engineRef.current.position.distanceTo(engineRef.current.mapStructure.siteAPosition));
          setDistToSiteB(engineRef.current.position.distanceTo(engineRef.current.mapStructure.siteBPosition));
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, [isPointerLocked]);

  // Pointer Lock Change Listener
  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvasRef.current;
      setIsPointerLocked(locked);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      // Escape or Tab
      if (e.code === 'Tab') {
        e.preventDefault();
        setIsScoreboardOpen((prev) => !prev);
        return;
      }

      // Ping Wheel (Z)
      if (e.code === 'KeyZ') {
        e.preventDefault();
        setIsPingWheelOpen((prev) => !prev);
        return;
      }

      // Reload (R)
      if (e.code === 'KeyR') {
        engineRef.current.reload();
        return;
      }

      // Ability Q
      if (e.code === 'KeyQ') {
        engineRef.current.castSkillQ();
        return;
      }

      // Ability E
      if (e.code === 'KeyE') {
        engineRef.current.castSkillE();
        return;
      }

      // Bomb interaction (F)
      if (e.code === 'KeyF') {
        engineRef.current.interactWithBomb();
      }

      // Movement modifiers
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current.isSprinting = true;
      }
      if (e.code === 'ControlLeft' || e.code === 'KeyC') {
        engineRef.current.isCrouching = true;
      }

      engineRef.current.keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current.isSprinting = false;
      }
      if (e.code === 'ControlLeft' || e.code === 'KeyC') {
        engineRef.current.isCrouching = false;
      }
      if (e.code === 'KeyF') {
        engineRef.current.stopBombInteraction();
      }

      engineRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse Event Listeners on Canvas
  const handleRequestPointerLock = () => {
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPointerLocked || !engineRef.current) return;
    engineRef.current.onMouseMove(e.movementX, e.movementY, mouseSensitivity);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPointerLocked) {
      handleRequestPointerLock();
      return;
    }

    if (!engineRef.current) return;

    if (e.button === 0) {
      // Left click: Fire weapon
      isMouseDownRef.current = true;
      engineRef.current.shoot();
    } else if (e.button === 2) {
      // Right click: Toggle ADS
      engineRef.current.isADS = !engineRef.current.isADS;
    } else if (e.button === 1) {
      // Middle click: Quick ping
      e.preventDefault();
      setIsPingWheelOpen(true);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isMouseDownRef.current = false;
    }
  };

  // Actions
  const handleSelectWeapon = (id: WeaponId) => {
    setCurrentWeaponId(id);
    if (engineRef.current) engineRef.current.switchWeapon(id);
  };

  const handleSelectRole = (role: HeroRoleId) => {
    setCurrentHeroRole(role);
    if (engineRef.current) engineRef.current.switchHero(role);
  };

  const handleSelectMode = (mode: GameModeId) => {
    setCurrentMode(mode);
    if (engineRef.current) engineRef.current.switchMode(mode);
  };

  const handleSendPing = (type: PingType) => {
    if (engineRef.current) {
      engineRef.current.sendTacticalPing(type);
    }
  };

  const activeWeapon = WEAPON_REGISTRY[currentWeaponId];
  const activeHero = HERO_REGISTRY[currentHeroRole];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={canvasMountRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Tactical HUD Overlay */}
      <HUD
        health={health}
        maxHealth={maxHealth}
        armor={armor}
        maxArmor={maxArmor}
        weapon={activeWeapon}
        ammoInMag={ammoInMag}
        reserveAmmo={reserveAmmo}
        isReloading={isReloading}
        reloadProgress={reloadProgress}
        crosshairBloom={crosshairBloom}
        isADS={isADS}
        isSliding={isSliding}
        isSprinting={isSprinting}
        isCrouching={isCrouching}
        hitmarkerActive={hitmarkerActive}
        hitmarkerIsHeadshot={hitmarkerIsHeadshot}
        hero={activeHero}
        cooldownQMs={cooldownQMs}
        cooldownEMs={cooldownEMs}
        killFeed={engineRef.current?.killFeed || []}
        activePings={engineRef.current?.pingManager?.getActivePings() || []}
        bombPlanted={bombPlanted}
        bombPlantTimer={bombPlantTimer}
        bombSite={bombSite}
        distToSiteA={distToSiteA}
        distToSiteB={distToSiteB}
        isPlantingBomb={isPlantingBomb}
        plantProgress={plantProgress}
        isDefusingBomb={isDefusingBomb}
        defuseProgress={defuseProgress}
        scoreAllies={scoreAllies}
        scoreEnemies={scoreEnemies}
        roundTimeSeconds={roundTimeSeconds}
        isPointerLocked={isPointerLocked}
        onRequestPointerLock={handleRequestPointerLock}
        onOpenPingWheel={() => setIsPingWheelOpen(true)}
      />

      {/* Collapsible Bottom Control Dock per Three.js directives */}
      <BottomDock
        currentWeaponId={currentWeaponId}
        onSelectWeapon={handleSelectWeapon}
        currentRole={currentHeroRole}
        onSelectRole={handleSelectRole}
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        onOpenWeaponBench={() => setIsWeaponBenchOpen(true)}
        onOpenAntiCheat={() => setIsAntiCheatOpen(true)}
        onOpenScoreboard={() => setIsScoreboardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Ping Wheel Modal */}
      <PingWheel
        isOpen={isPingWheelOpen}
        onSelect={handleSendPing}
        onClose={() => setIsPingWheelOpen(false)}
      />

      {/* Weapon Bench & Recoil Inspector Modal */}
      <WeaponBenchModal
        isOpen={isWeaponBenchOpen}
        onClose={() => setIsWeaponBenchOpen(false)}
        activeWeaponId={currentWeaponId}
        onSelectWeapon={handleSelectWeapon}
      />

      {/* Vanguard Anti-Cheat & Fair Play Telemetry Modal */}
      <AntiCheatModal
        isOpen={isAntiCheatOpen}
        onClose={() => setIsAntiCheatOpen(false)}
        playerMMR={playerMMR}
      />

      {/* Scoreboard Modal */}
      <ScoreboardModal
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
        playerStats={
          engineRef.current?.stats || {
            kills: 0,
            deaths: 0,
            assists: 0,
            headshots: 0,
            damageDealt: 0,
            plants: 0,
            defuses: 0,
            combatScore: 0,
          }
        }
        scoreAllies={scoreAllies}
        scoreEnemies={scoreEnemies}
        bots={engineRef.current?.botAI?.bots || []}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mouseSensitivity={mouseSensitivity}
        onSensitivityChange={setMouseSensitivity}
      />
    </div>
  );
}
