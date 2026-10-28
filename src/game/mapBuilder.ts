/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GameModeId } from '../types/game';
import { ProceduralTextureGenerator } from './proceduralTextures';

export interface MapObstacle {
  mesh: THREE.Mesh | THREE.Group;
  box: THREE.Box3;
  isCover: boolean;
  type?: 'wall' | 'crate' | 'barrier' | 'pillar' | 'target';
}

export interface MapStructure {
  group: THREE.Group;
  obstacles: MapObstacle[];
  spawnAttackers: THREE.Vector3;
  spawnDefenders: THREE.Vector3;
  siteAPosition: THREE.Vector3;
  siteBPosition: THREE.Vector3;
  recoilWallPosition?: THREE.Vector3;
  targetDummies?: { position: THREE.Vector3; distanceMeters: number; mesh: THREE.Group }[];
}

export class MapBuilder {
  public static buildMap(mode: GameModeId): MapStructure {
    const group = new THREE.Group();
    const obstacles: MapObstacle[] = [];

    // Pre-create reusable procedural textures
    const floorTex = ProceduralTextureGenerator.createTacticalFloorTexture();
    floorTex.repeat.set(16, 16);
    const wallTex = ProceduralTextureGenerator.createWallTexture();
    wallTex.repeat.set(4, 1);
    const crateTexGreen = ProceduralTextureGenerator.createCrateTexture('#2d5a3f');
    const crateTexBlue = ProceduralTextureGenerator.createCrateTexture('#1e3a8a');
    const crateTexOrange = ProceduralTextureGenerator.createCrateTexture('#c2410c');

    // Materials
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.65,
      metalness: 0.35,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.75,
      metalness: 0.2,
    });
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.8,
      metalness: 0.2,
    });

    if (mode === 'firing_range') {
      return this.buildFiringRange(group, obstacles, floorMat, wallMat);
    }

    // 1. Tactical Ground Plane (60m x 80m arena)
    const floorGeo = new THREE.PlaneGeometry(70, 90);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // 2. Perimeter Walls (Prevent falling into void, balanced height = 4.5m)
    const wallHeight = 4.5;
    const addWall = (x: number, z: number, w: number, d: number, label: string = 'wall') => {
      const wallGeo = new THREE.BoxGeometry(w, wallHeight, d);
      const wall = new THREE.Mesh(wallGeo, label.includes('border') ? borderMat : wallMat);
      wall.position.set(x, wallHeight / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      group.add(wall);

      const box = new THREE.Box3().setFromObject(wall);
      obstacles.push({ mesh: wall, box, isCover: true, type: 'wall' });
      return wall;
    };

    // Outer bounding perimeter
    addWall(0, -45, 70, 2, 'border'); // North
    addWall(0, 45, 70, 2, 'border');  // South
    addWall(-35, 0, 2, 90, 'border'); // West
    addWall(35, 0, 2, 90, 'border');  // East

    // Helper to add tactical crates/containers
    const addCrate = (x: number, y: number, z: number, w: number, h: number, d: number, colorTex: THREE.CanvasTexture) => {
      const crateGeo = new THREE.BoxGeometry(w, h, d);
      const crateMat = new THREE.MeshStandardMaterial({
        map: colorTex,
        roughness: 0.4,
        metalness: 0.45,
      });
      const crate = new THREE.Mesh(crateGeo, crateMat);
      crate.position.set(x, y + h / 2, z);
      crate.castShadow = true;
      crate.receiveShadow = true;
      group.add(crate);

      const box = new THREE.Box3().setFromObject(crate);
      obstacles.push({ mesh: crate, box, isCover: true, type: 'crate' });
      return crate;
    };

    // 3. Three-Lane Competitive Layout
    // Mid Lane Chokepoints (x: -5 to +5, z: -15 to +15)
    addWall(-7, 0, 1.2, 20, 'mid_west_wall');
    addWall(7, 0, 1.2, 20, 'mid_east_wall');

    // Central Mid Courtyard Cover Crates
    addCrate(0, 0, 0, 2.8, 1.6, 2.8, crateTexOrange);
    addCrate(2.8, 0, 3, 2, 1.3, 2, crateTexGreen);
    addCrate(-3.2, 0, -4, 2, 1.3, 2, crateTexBlue);

    // 4. Site A (West Flank, x = -20 to -30, z = -10 to -25)
    // Site A Elevated Platform
    const platGeo = new THREE.BoxGeometry(14, 1.2, 16);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x272f3d, roughness: 0.6, metalness: 0.3 });
    const plat = new THREE.Mesh(platGeo, platMat);
    plat.position.set(-20, 0.6, -18);
    plat.receiveShadow = true;
    plat.castShadow = true;
    group.add(plat);
    obstacles.push({ mesh: plat, box: new THREE.Box3().setFromObject(plat), isCover: false });

    // Site A Cover structures & Crates
    addCrate(-22, 1.2, -18, 2.4, 1.8, 2.4, crateTexGreen);
    addCrate(-16, 1.2, -20, 2.2, 1.4, 2.2, crateTexOrange);
    addWall(-27, 0, 1.2, 12, 'site_a_def_wall');

    // Site A Decal on ground
    const siteADecalTex = ProceduralTextureGenerator.createBombSiteDecal('A');
    const decalAGeo = new THREE.PlaneGeometry(6, 6);
    const decalAMat = new THREE.MeshBasicMaterial({
      map: siteADecalTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const decalAMesh = new THREE.Mesh(decalAGeo, decalAMat);
    decalAMesh.rotation.x = -Math.PI / 2;
    decalAMesh.position.set(-20, 1.22, -15);
    group.add(decalAMesh);

    // 5. Site B (East Flank, x = 18 to 30, z = 10 to 25)
    // Server / Generator room walls
    addWall(16, 18, 1.2, 14, 'site_b_west_wall');
    addWall(24, 25, 14, 1.2, 'site_b_north_wall');
    addCrate(22, 0, 15, 3.2, 2.2, 2.8, crateTexBlue);
    addCrate(26, 0, 19, 2.4, 1.5, 2.4, crateTexOrange);

    // Site B Decal
    const siteBDecalTex = ProceduralTextureGenerator.createBombSiteDecal('B');
    const decalBGeo = new THREE.PlaneGeometry(6, 6);
    const decalBMat = new THREE.MeshBasicMaterial({
      map: siteBDecalTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const decalBMesh = new THREE.Mesh(decalBGeo, decalBMat);
    decalBMesh.rotation.x = -Math.PI / 2;
    decalBMesh.position.set(22, 0.02, 18);
    group.add(decalBMesh);

    // Flank Connectors & Corridors
    addWall(-18, 10, 14, 1.2, 'west_flank_corridor');
    addWall(18, -10, 14, 1.2, 'east_flank_corridor');

    // Accent Lighting Towers (procedural lights)
    const addLampPost = (x: number, z: number, color: number) => {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 2.5, z);
      group.add(pole);

      const lampHeadGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const lampHeadMat = new THREE.MeshBasicMaterial({ color });
      const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      lampHead.position.set(x, 5.1, z);
      group.add(lampHead);

      const pointLight = new THREE.PointLight(color, 25, 18);
      pointLight.position.set(x, 5.0, z);
      group.add(pointLight);
    };

    addLampPost(-20, -18, 0xef4444); // Red light over Site A
    addLampPost(22, 18, 0x3b82f6);  // Blue light over Site B
    addLampPost(0, 0, 0x00f0ff);    // Cyan light over Mid

    return {
      group,
      obstacles,
      spawnAttackers: new THREE.Vector3(0, 0, 36), // South
      spawnDefenders: new THREE.Vector3(0, 0, -36), // North
      siteAPosition: new THREE.Vector3(-20, 0, -15),
      siteBPosition: new THREE.Vector3(22, 0, 18),
    };
  }

  // Firing Range & Recoil Benchmark Lab
  private static buildFiringRange(
    group: THREE.Group,
    obstacles: MapObstacle[],
    floorMat: THREE.MeshStandardMaterial,
    wallMat: THREE.MeshStandardMaterial
  ): MapStructure {
    // 1. Clean Testing Range Floor (25m x 65m)
    const floorGeo = new THREE.PlaneGeometry(30, 70);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // Range Boundary Walls
    const wallHeight = 5;
    const addWall = (x: number, z: number, w: number, d: number) => {
      const wallGeo = new THREE.BoxGeometry(w, wallHeight, d);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(x, wallHeight / 2, z);
      wall.receiveShadow = true;
      group.add(wall);
      obstacles.push({ mesh: wall, box: new THREE.Box3().setFromObject(wall), isCover: true, type: 'wall' });
      return wall;
    };

    addWall(0, -32, 30, 2);  // Far Target Wall
    addWall(0, 32, 30, 2);   // Rear Wall
    addWall(-14, 0, 2, 64);  // Left Wall
    addWall(14, 0, 2, 64);   // Right Wall

    // 2. High-Precision Recoil Test Wall at -30m
    const recoilWallGeo = new THREE.BoxGeometry(10, 4.5, 0.4);
    const canvasRecoil = document.createElement('canvas');
    canvasRecoil.width = 512;
    canvasRecoil.height = 256;
    const ctx = canvasRecoil.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);

    // Grid coordinates
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RECOIL PATTERN BENCHMARK (10M)', 256, 40);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Tembak di sini untuk menganalisis recoil kick & kompensasi mouse', 256, 70);

    const recoilTex = new THREE.CanvasTexture(canvasRecoil);
    recoilTex.colorSpace = THREE.SRGBColorSpace;

    const recoilMat = new THREE.MeshStandardMaterial({
      map: recoilTex,
      roughness: 0.3,
      metalness: 0.5,
    });
    const recoilWall = new THREE.Mesh(recoilWallGeo, recoilMat);
    recoilWall.position.set(0, 2.25, -20);
    group.add(recoilWall);
    obstacles.push({ mesh: recoilWall, box: new THREE.Box3().setFromObject(recoilWall), isCover: true, type: 'wall' });

    // 3. Target Practice Dummies (at 10m, 20m, 30m)
    const targetDummies: { position: THREE.Vector3; distanceMeters: number; mesh: THREE.Group }[] = [];
    const distances = [10, 20, 30];
    const targetTex = ProceduralTextureGenerator.createTargetDummyTexture();

    distances.forEach((dist, idx) => {
      const dummyGroup = new THREE.Group();
      const xPos = -6 + idx * 6;
      const zPos = -dist + 5;

      // Dummy Base stand
      const baseGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.2, 16);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.1;
      dummyGroup.add(base);

      // Target Torso Board
      const boardGeo = new THREE.BoxGeometry(0.8, 1.8, 0.08);
      const boardMat = new THREE.MeshStandardMaterial({ map: targetTex, roughness: 0.5, metalness: 0.2 });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.y = 1.1;
      board.castShadow = true;
      dummyGroup.add(board);

      // Distance indicator banner above
      const canvasDist = document.createElement('canvas');
      canvasDist.width = 128;
      canvasDist.height = 64;
      const dCtx = canvasDist.getContext('2d')!;
      dCtx.fillStyle = '#0284c7';
      dCtx.fillRect(0, 0, 128, 64);
      dCtx.fillStyle = '#fff';
      dCtx.font = 'bold 28px monospace';
      dCtx.textAlign = 'center';
      dCtx.fillText(`${dist}M`, 64, 42);
      const distTex = new THREE.CanvasTexture(canvasDist);
      distTex.colorSpace = THREE.SRGBColorSpace;
      const labelGeo = new THREE.PlaneGeometry(0.6, 0.3);
      const labelMat = new THREE.MeshBasicMaterial({ map: distTex });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(0, 2.2, 0);
      dummyGroup.add(labelMesh);

      dummyGroup.position.set(xPos, 0, zPos);
      group.add(dummyGroup);

      const dummyBox = new THREE.Box3().setFromObject(board);
      obstacles.push({ mesh: board, box: dummyBox, isCover: true, type: 'target' });

      targetDummies.push({
        position: dummyGroup.position.clone(),
        distanceMeters: dist,
        mesh: dummyGroup,
      });
    });

    // 4. Movement Practice Obstacle (Slide under low barrier + Jump hurdle)
    // Low slide bridge (height 1.25m - requires sliding/crouching!)
    const bridgeGeo = new THREE.BoxGeometry(6, 0.3, 3);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.6, roughness: 0.3 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(8, 1.3, 0);
    group.add(bridge);
    obstacles.push({ mesh: bridge, box: new THREE.Box3().setFromObject(bridge), isCover: true });

    // Jump hurdle (height 0.85m - player must jump over!)
    const hurdleGeo = new THREE.BoxGeometry(4, 0.85, 0.4);
    const hurdleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.4 });
    const hurdle = new THREE.Mesh(hurdleGeo, hurdleMat);
    hurdle.position.set(8, 0.425, 8);
    group.add(hurdle);
    obstacles.push({ mesh: hurdle, box: new THREE.Box3().setFromObject(hurdle), isCover: true });

    return {
      group,
      obstacles,
      spawnAttackers: new THREE.Vector3(0, 0, 18),
      spawnDefenders: new THREE.Vector3(0, 0, -25),
      siteAPosition: new THREE.Vector3(-6, 0, -10),
      siteBPosition: new THREE.Vector3(6, 0, -10),
      recoilWallPosition: new THREE.Vector3(0, 2.25, -20),
      targetDummies,
    };
  }
}
