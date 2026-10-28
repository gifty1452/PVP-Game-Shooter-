/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Generate procedural textures with HTML5 Canvas (zero external dependencies)
export class ProceduralTextureGenerator {
  // Metallic tactical floor with panel seams and non-slip studs
  public static createTacticalFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dark industrial slate
    ctx.fillStyle = '#1e242d';
    ctx.fillRect(0, 0, 512, 512);

    // Grid panels
    ctx.strokeStyle = '#11161d';
    ctx.lineWidth = 4;
    const tileSize = 64;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Rivet dots at intersections
    ctx.fillStyle = '#3a4454';
    for (let x = tileSize; x < 512; x += tileSize) {
      for (let y = tileSize; y < 512; y += tileSize) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Subtle noise grain
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Tactical concrete wall with reinforcement beams
  public static createWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Neutral military concrete
    ctx.fillStyle = '#333b47';
    ctx.fillRect(0, 0, 512, 512);

    // Horizontal concrete block lines
    ctx.strokeStyle = '#222731';
    ctx.lineWidth = 3;
    for (let y = 0; y <= 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Vertical seams alternating
    for (let row = 0; row < 4; row++) {
      const y1 = row * 128;
      const y2 = (row + 1) * 128;
      const offset = (row % 2) * 128;
      for (let x = offset; x <= 512; x += 256) {
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }
    }

    // Subtle yellow hazard warning stripe at bottom
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(0, 480, 512, 32);
    ctx.fillStyle = '#111';
    for (let x = -32; x < 544; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + 24, 480);
      ctx.lineTo(x + 48, 480);
      ctx.lineTo(x + 24, 512);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Military Crate / Cargo container texture
  public static createCrateTexture(colorTheme: string = '#2d5a3f'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Outer frame
    ctx.fillStyle = colorTheme;
    ctx.fillRect(0, 0, 256, 256);

    // Inner bevel border
    ctx.fillStyle = '#1b2621';
    ctx.fillRect(16, 16, 224, 224);

    // Diagonal reinforced struts
    ctx.strokeStyle = colorTheme;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(16, 16);
    ctx.lineTo(240, 240);
    ctx.moveTo(240, 16);
    ctx.lineTo(16, 240);
    ctx.stroke();

    // Stencil Military Logo
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TAC-UNIT', 128, 120);
    ctx.font = 'bold 16px monospace';
    ctx.fillText('CRATE-09', 128, 148);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Bomb Site Indicator Decal (Site A or Site B)
  public static createBombSiteDecal(siteLetter: 'A' | 'B'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);

    // Outer tactical ring
    ctx.strokeStyle = siteLetter === 'A' ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dashed ring
    ctx.setLineDash([12, 12]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 128, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Big Letter
    ctx.fillStyle = siteLetter === 'A' ? '#ef4444' : '#3b82f6';
    ctx.font = '900 110px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(siteLetter, 128, 128);

    // Subtext
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`SITE ${siteLetter}`, 128, 205);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Target Dummy Bullseye Texture (for Firing Range & Recoil testing)
  public static createTargetDummyTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Silhouette body
    ctx.fillStyle = '#222831';
    ctx.fillRect(0, 0, 256, 512);

    // Head target ring (2.5x critical zone)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(128, 70, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 70, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(128, 70, 10, 0, Math.PI * 2);
    ctx.fill();

    // Torso rings (1.0x zone)
    const torsoY = 240;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(128, torsoY, 70, 100, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(128, torsoY, 40, 60, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CRITICAL 2.5X', 128, 135);
    ctx.fillText('TORSO 1.0X', 128, 245);
    ctx.font = '16px monospace';
    ctx.fillText('LIMB 0.75X', 128, 420);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
