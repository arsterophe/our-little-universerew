/**
 * SHADOW — CRYSTAL TOWER: 2D TOP-DOWN / 3/4 FANTASY CANVAS RENDERER
 *
 * Renders the living 6-room Crystal Tower world in crisp donghua night-fantasy
 * aesthetics (midnight blue, lavender, violet, crystal silver, warm amber hearth):
 * - Exterior dynamic Time-of-Day sky, Moon, Constellations & Weather (Rain/Mist/Snow)
 * - Architectural 3/4 room interiors, doorways/portals, carpets, and lighting halos
 * - Detailed custom-drawn furniture for every room + customizable Bedroom decor
 * - 4-direction animated Lele character sprite with live outfit colors & activity poses
 * - Floating fireflies, crystal particles, and diegetic `[ E ]` interaction prompts
 */

import {
  TOWER_WORLD_WIDTH,
  TOWER_WORLD_HEIGHT,
  TIME_CYCLES,
  LELE_OUTFITS,
  ROOM_DECOR_ITEMS,
  TOWER_ROOMS
} from './shadow_crystal_tower_data.js';

function createParticlePool(count, maxW, maxH, kind) {
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: Math.random() * maxW,
      y: Math.random() * maxH,
      r: kind === 'rain' ? 12 + Math.random() * 14 : (1.2 + Math.random() * 2.4),
      vx: kind === 'firefly' ? (Math.random() - 0.5) * 18 : (kind === 'snow' ? (Math.random() - 0.5) * 20 : 0),
      vy: kind === 'rain' ? 320 + Math.random() * 180 : (kind === 'snow' ? 36 + Math.random() * 34 : -8 - Math.random() * 14),
      phase: Math.random() * Math.PI * 2
    });
  }
  return list;
}

export function createCrystalTowerRenderer() {
  const fireflies = createParticlePool(24, TOWER_WORLD_WIDTH, TOWER_WORLD_HEIGHT, 'firefly');
  const crystalMotes = createParticlePool(18, TOWER_WORLD_WIDTH, TOWER_WORLD_HEIGHT, 'mote');
  const rainDrops = createParticlePool(70, TOWER_WORLD_WIDTH, TOWER_WORLD_HEIGHT, 'rain');
  const snowFlakes = createParticlePool(55, TOWER_WORLD_WIDTH, TOWER_WORLD_HEIGHT, 'snow');
  const stars = Array.from({ length: 65 }, (_, i) => ({
    x: ((i * 137.5) % 920) + 20,
    y: ((i * 73.1) % 240) + 12,
    r: (i % 3 === 0) ? 2.1 : 1.2,
    phase: i * 0.7
  }));

  function roundRectPath(ctx, x, y, w, h, r = 8) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function getTimeMeta(timeId) {
    return TIME_CYCLES.find((t) => t.id === timeId) || TIME_CYCLES[1];
  }

  function drawSkyRegion(ctx, x, y, w, h, timeMeta, weather, nowSec, includePanorama = false) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, timeMeta.windowSkyTop);
    grad.addColorStop(1, timeMeta.windowSkyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Stars
    for (const st of stars) {
      const sx = x + ((st.x / TOWER_WORLD_WIDTH) * w);
      const sy = y + ((st.y / 250) * h);
      const twinkle = 0.45 + 0.55 * Math.sin(nowSec * 2.1 + st.phase);
      ctx.fillStyle = `rgba(226, 232, 240, ${(timeMeta.starOpacity * twinkle).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, st.r * (includePanorama ? 1.15 : 0.85), 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Crescent / Full Moon
    const moonX = x + w * 0.72;
    const moonY = y + h * 0.34;
    const moonR = includePanorama ? 42 : Math.min(w, h) * 0.22;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.2, moonX, moonY, moonR * 2.6);
    moonGlow.addColorStop(0, `rgba(226, 232, 255, ${(timeMeta.moonOpacity * 0.45).toFixed(2)})`);
    moonGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(241, 245, 249, ${timeMeta.moonOpacity})`;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    if (includePanorama) {
      // Distant floating sanctuary spires & crystal mountain silhouette
      ctx.fillStyle = '#090e28';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w * 0.14, y + h * 0.68);
      ctx.lineTo(x + w * 0.28, y + h * 0.84);
      ctx.lineTo(x + w * 0.48, y + h * 0.6);
      ctx.lineTo(x + w * 0.66, y + h * 0.8);
      ctx.lineTo(x + w * 0.84, y + h * 0.65);
      ctx.lineTo(x + w, y + h * 0.85);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
    }

    // Weather inside window / balcony sky
    if (weather === 'rain') {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
      ctx.lineWidth = 1.2;
      for (const drop of rainDrops) {
        const rx = x + (drop.x % w);
        const ry = y + (drop.y % h);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 3, ry + 11);
        ctx.stroke();
      }
    } else if (weather === 'snow') {
      ctx.fillStyle = 'rgba(241, 245, 249, 0.78)';
      for (const sf of snowFlakes) {
        const sx = x + (sf.x % w);
        const sy = y + (sf.y % h);
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weather === 'mist') {
      const mistGrad = ctx.createLinearGradient(x, y + h * 0.35, x, y + h);
      mistGrad.addColorStop(0, 'rgba(196, 181, 253, 0.05)');
      mistGrad.addColorStop(1, 'rgba(203, 213, 225, 0.42)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(x, y, w, h);
    }

    ctx.restore();
  }

  function drawRoomArchitecture(ctx, room, state, timeMeta, nowSec) {
    // Deep nocturnal surround background
    ctx.fillStyle = '#050817';
    ctx.fillRect(0, 0, TOWER_WORLD_WIDTH, TOWER_WORLD_HEIGHT);

    if (room.id === 'balcony') {
      // Top half open cosmic sky balcony
      drawSkyRegion(ctx, 40, 12, 880, 180, timeMeta, state.weather, nowSec, true);

      // Stone terrace floor
      const floorGrad = ctx.createLinearGradient(0, 168, 0, 560);
      floorGrad.addColorStop(0, '#1e1b4b');
      floorGrad.addColorStop(1, '#111633');
      ctx.fillStyle = floorGrad;
      roundRectPath(ctx, 82, 168, 796, 376, 16);
      ctx.fill();

      // Stone tile lines
      ctx.strokeStyle = 'rgba(196, 181, 253, 0.14)';
      ctx.lineWidth = 1;
      for (let gx = 82; gx <= 878; gx += 64) {
        ctx.beginPath();
        ctx.moveTo(gx, 168);
        ctx.lineTo(gx, 544);
        ctx.stroke();
      }
      for (let gy = 168; gy <= 544; gy += 56) {
        ctx.beginPath();
        ctx.moveTo(82, gy);
        ctx.lineTo(878, gy);
        ctx.stroke();
      }

      // Silver crystal balustrade along top parapet
      ctx.fillStyle = '#312e81';
      ctx.fillRect(76, 152, 808, 16);
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      ctx.strokeRect(76, 152, 808, 16);
      for (let px = 104; px < 860; px += 48) {
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(px, 168, 10, 14);
        // glowing little crystal tips
        ctx.fillStyle = `rgba(196, 181, 253, ${(0.55 * timeMeta.crystalGlow).toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(px + 5, 142);
        ctx.lineTo(px + 10, 152);
        ctx.lineTo(px, 152);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Interior Room Walls (3/4 top-down back wall + side trims)
      const wallGrad = ctx.createLinearGradient(0, 38, 0, 128);
      wallGrad.addColorStop(0, '#121536');
      wallGrad.addColorStop(1, '#1d1b4b');
      ctx.fillStyle = wallGrad;
      roundRectPath(ctx, 56, 38, 848, 92, 12);
      ctx.fill();

      // Wainscoting & crystal wall trim
      ctx.fillStyle = '#252159';
      ctx.fillRect(58, 104, 844, 24);
      ctx.strokeStyle = 'rgba(196, 181, 253, 0.35)';
      ctx.lineWidth = 2;
      roundRectPath(ctx, 56, 38, 848, 506, 14);
      ctx.stroke();

      // Interior Floor Theme
      const floorThemes = {
        lavender_wood: ['#1b173d', '#241e4e', 'rgba(167, 139, 250, 0.11)'],
        indigo_marble: ['#141a3f', '#1c2454', 'rgba(147, 197, 253, 0.12)'],
        kitchen_tile: ['#181c44', '#22285a', 'rgba(224, 231, 255, 0.14)'],
        library_mahogany: ['#1f1434', '#2b1942', 'rgba(251, 191, 36, 0.08)'],
        crystal_bath: ['#112046', '#162c59', 'rgba(165, 243, 252, 0.14)']
      };
      const [c1, c2, lineCol] = floorThemes[room.floorTheme] || floorThemes.lavender_wood;
      const fg = ctx.createLinearGradient(0, 128, 0, 540);
      fg.addColorStop(0, c1);
      fg.addColorStop(1, c2);
      ctx.fillStyle = fg;
      ctx.fillRect(60, 128, 840, 412);

      // Subtle floor plank / tile grid
      ctx.strokeStyle = lineCol;
      ctx.lineWidth = 1;
      for (let fy = 128; fy <= 540; fy += 46) {
        ctx.beginPath();
        ctx.moveTo(60, fy);
        ctx.lineTo(900, fy);
        ctx.stroke();
      }
      if (room.floorTheme === 'kitchen_tile' || room.floorTheme === 'crystal_bath' || room.floorTheme === 'indigo_marble') {
        for (let fx = 60; fx <= 900; fx += 60) {
          ctx.beginPath();
          ctx.moveTo(fx, 128);
          ctx.lineTo(fx, 540);
          ctx.stroke();
        }
      }

      // Central woven starlight rug in bedroom/living/library
      if (room.id === 'bedroom' || room.id === 'living_room' || room.id === 'library') {
        ctx.save();
        const rugX = room.id === 'bedroom' ? 280 : 300;
        const rugY = room.id === 'bedroom' ? 308 : 265;
        const rugW = room.id === 'bedroom' ? 260 : 320;
        const rugH = room.id === 'bedroom' ? 148 : 152;
        roundRectPath(ctx, rugX, rugY, rugW, rugH, 22);
        ctx.fillStyle = room.id === 'library' ? 'rgba(91, 33, 182, 0.36)' : 'rgba(109, 40, 217, 0.28)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(229, 185, 99, 0.42)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // crescent motif inside rug
        ctx.strokeStyle = 'rgba(196, 181, 253, 0.35)';
        ctx.beginPath();
        ctx.arc(rugX + rugW / 2, rugY + rugH / 2, 26, 0.4, Math.PI * 1.65);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Glowing Wall Crystal Sconces on top wall (except balcony)
    if (room.id !== 'balcony') {
      [115, 845].forEach((sx) => {
        const glow = ctx.createRadialGradient(sx, 86, 4, sx, 86, 48);
        glow.addColorStop(0, `rgba(196, 181, 253, ${(0.55 * timeMeta.crystalGlow).toFixed(2)})`);
        glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, 86, 48, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ddd6fe';
        ctx.beginPath();
        ctx.moveTo(sx, 68);
        ctx.lineTo(sx + 8, 86);
        ctx.lineTo(sx, 100);
        ctx.lineTo(sx - 8, 86);
        ctx.closePath();
        ctx.fill();
      });
    }

    // Render Glowing Doorway Portals
    for (const p of room.portals) {
      const pulse = 0.55 + 0.3 * Math.sin(nowSec * 3);
      ctx.save();
      const grad = ctx.createRadialGradient(
        p.x + p.w / 2, p.y + p.h / 2, 4,
        p.x + p.w / 2, p.y + p.h / 2, Math.max(p.w, p.h) * 0.8
      );
      grad.addColorStop(0, `rgba(167, 139, 250, ${(0.52 * pulse).toFixed(2)})`);
      grad.addColorStop(1, 'rgba(91, 33, 182, 0.08)');
      roundRectPath(ctx, p.x, p.y, p.w, p.h, 10);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = `rgba(221, 214, 254, ${(0.7 * pulse).toFixed(2)})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Subtle door label pill
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e2e8f0';
      const labelY = p.y > 460 ? p.y - 8 : (p.y < 140 ? p.y + p.h + 14 : p.y - 8);
      ctx.fillText(p.label, p.x + p.w / 2, labelY);
      ctx.restore();
    }
  }

  function drawWindowObject(ctx, obj, state, timeMeta, nowSec) {
    // Ornate arched crystal window frame
    ctx.save();
    roundRectPath(ctx, obj.x, obj.y - 46, obj.w, 86, 16);
    ctx.fillStyle = '#2e256b';
    ctx.fill();
    drawSkyRegion(ctx, obj.x + 8, obj.y - 38, obj.w - 16, 70, timeMeta, state.weather, nowSec, false);
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 3;
    roundRectPath(ctx, obj.x + 6, obj.y - 40, obj.w - 12, 74, 12);
    ctx.stroke();
    // Window mullions
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obj.x + obj.w / 2, obj.y - 40);
    ctx.lineTo(obj.x + obj.w / 2, obj.y + 34);
    ctx.moveTo(obj.x + 6, obj.y - 4);
    ctx.lineTo(obj.x + obj.w - 6, obj.y - 4);
    ctx.stroke();
    ctx.restore();
  }

  function drawRoomDecorations(ctx, state, nowSec) {
    if (state.currentRoom !== 'bedroom') return;
    for (const id of state.equippedDecorations) {
      const decor = ROOM_DECOR_ITEMS.find((d) => d.id === id);
      if (!decor || !decor.spot) continue;
      const { x, y } = decor.spot;
      const pulse = 0.75 + 0.25 * Math.sin(nowSec * 3.2 + x);
      ctx.save();
      const glow = ctx.createRadialGradient(x, y, 2, x, y, 24);
      glow.addColorStop(0, `rgba(196, 181, 253, ${(0.55 * pulse).toFixed(2)})`);
      glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();

      if (id === 'crescent_crystal') {
        ctx.fillStyle = '#ddd6fe';
        ctx.beginPath();
        ctx.arc(x, y - 4, 9, 0.3, Math.PI * 1.75);
        ctx.fill();
      } else if (id === 'amethyst_geode') {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(x, y - 16);
        ctx.lineTo(x + 10, y);
        ctx.lineTo(x + 5, y + 8);
        ctx.lineTo(x - 7, y + 8);
        ctx.lineTo(x - 11, y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f5d0fe';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (id === 'snowdrop_vase') {
        ctx.fillStyle = '#475569';
        roundRectPath(ctx, x - 7, y - 4, 14, 14, 4);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(x - 4, y - 10, 4, 0, Math.PI * 2);
        ctx.arc(x + 4, y - 12, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === 'starlight_lantern') {
        ctx.fillStyle = '#fde68a';
        roundRectPath(ctx, x - 7, y - 12, 14, 18, 4);
        ctx.fill();
        ctx.strokeStyle = '#e5b963';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawFurnitureObject(ctx, obj, state, timeMeta, nowSec) {
    const { x, y, w, h, id } = obj;
    ctx.save();

    if (id === 'bedroom_window' || id === 'living_window') {
      drawWindowObject(ctx, obj, state, timeMeta, nowSec);
      ctx.restore();
      return;
    }

    if (id === 'bed') {
      // Ornate Crystal Canopy Bed
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      roundRectPath(ctx, x + 6, y + 10, w, h, 14);
      ctx.fill();

      // Headboard & Frame
      ctx.fillStyle = '#2e1a47';
      roundRectPath(ctx, x, y, w, h, 12);
      ctx.fill();
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mattress & Lavender Duvet
      ctx.fillStyle = '#f1f5f9';
      roundRectPath(ctx, x + 10, y + 14, w - 20, h - 22, 8);
      ctx.fill();
      const blanket = ctx.createLinearGradient(x + 10, y + 48, x + w - 10, y + h - 8);
      blanket.addColorStop(0, '#4c1d95');
      blanket.addColorStop(1, '#312e81');
      ctx.fillStyle = blanket;
      roundRectPath(ctx, x + 10, y + 48, w - 20, h - 56, 8);
      ctx.fill();

      // Pillows
      ctx.fillStyle = '#ddd6fe';
      roundRectPath(ctx, x + 20, y + 18, 56, 26, 6);
      ctx.fill();
      roundRectPath(ctx, x + w - 76, y + 18, 56, 26, 6);
      ctx.fill();

      // Canopy Posts
      [[x + 4, y + 4], [x + w - 14, y + 4], [x + 4, y + h - 14], [x + w - 14, y + h - 14]].forEach(([px, py]) => {
        ctx.fillStyle = '#e5b963';
        ctx.fillRect(px, py, 10, 10);
      });
    } else if (id === 'wardrobe') {
      ctx.fillStyle = '#2b194d';
      roundRectPath(ctx, x, y - 16, w, h + 16, 8);
      ctx.fill();
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y - 12);
      ctx.lineTo(x + w / 2, y + h - 4);
      ctx.stroke();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(x + w / 2 - 8, y + h / 2, 3, 0, Math.PI * 2);
      ctx.arc(x + w / 2 + 8, y + h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'study_desk') {
      // Desk body
      ctx.fillStyle = '#3b245e';
      roundRectPath(ctx, x, y, w, h - 22, 8);
      ctx.fill();
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // Open journal, quill & crystal lamp
      ctx.fillStyle = '#fef3c7';
      roundRectPath(ctx, x + 46, y + 16, 44, 30, 3);
      ctx.fill();
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.arc(x + 22, y + 20, 9, 0, Math.PI * 2);
      ctx.fill();
      // Velvet chair tucked at bottom of desk
      ctx.fillStyle = '#4c1d95';
      roundRectPath(ctx, x + w / 2 - 20, y + h - 20, 40, 26, 8);
      ctx.fill();
      ctx.strokeStyle = '#e5b963';
      ctx.stroke();
    } else if (id === 'bedroom_bookshelf' || id === 'grand_shelves_left' || id === 'grand_shelves_right' || id === 'collection_shelf') {
      ctx.fillStyle = '#2a1847';
      roundRectPath(ctx, x, y - 10, w, h + 10, 8);
      ctx.fill();
      ctx.strokeStyle = '#b48bf5';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Colorful fantasy book spines
      const colors = ['#a78bfa', '#38bdf8', '#f472b6', '#fde68a', '#818cf8', '#c084fc'];
      const rows = Math.max(2, Math.floor(h / 28));
      for (let r = 0; r < rows; r++) {
        const sy = y + r * 26 + 4;
        ctx.fillStyle = '#180d2e';
        ctx.fillRect(x + 6, sy + 16, w - 12, 4);
        for (let bx = x + 10; bx < x + w - 18; bx += 11) {
          ctx.fillStyle = colors[(bx + r) % colors.length];
          ctx.fillRect(bx, sy, 8, 16);
        }
      }
    } else if (id === 'decor_pedestal') {
      ctx.fillStyle = '#251e54';
      roundRectPath(ctx, x, y, w, h, 10);
      ctx.fill();
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else if (id === 'tidy_rug') {
      // Subtle floor highlight rune on the bedroom rug
      ctx.strokeStyle = 'rgba(229, 185, 99, 0.35)';
      ctx.setLineDash([4, 4]);
      roundRectPath(ctx, x, y, w, h, 14);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (id === 'crystal_fireplace') {
      ctx.fillStyle = '#1e1b4b';
      roundRectPath(ctx, x, y - 14, w, h + 14, 10);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Hearth glow + animated violet-amber flames
      const fg = ctx.createRadialGradient(x + w / 2, y + h - 20, 6, x + w / 2, y + h - 10, 95);
      fg.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
      fg.addColorStop(0.5, 'rgba(167, 139, 250, 0.25)');
      fg.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - 10, 95, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090d1e';
      roundRectPath(ctx, x + 28, y + 18, w - 56, h - 22, 8);
      ctx.fill();
      for (let f = -1; f <= 1; f++) {
        const fh = 18 + Math.sin(nowSec * 9 + f) * 5;
        ctx.fillStyle = f === 0 ? '#fde68a' : '#c084fc';
        ctx.beginPath();
        ctx.moveTo(x + w / 2 + f * 18, y + h - 10 - fh);
        ctx.lineTo(x + w / 2 + f * 18 + 10, y + h - 8);
        ctx.lineTo(x + w / 2 + f * 18 - 10, y + h - 8);
        ctx.closePath();
        ctx.fill();
      }
    } else if (id === 'sofa' || id === 'reading_nook_chair' || id === 'lounge_chair') {
      ctx.fillStyle = '#3b1d68';
      roundRectPath(ctx, x, y, w, h, 14);
      ctx.fill();
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Backrest & cushion tufts
      ctx.fillStyle = '#29124d';
      roundRectPath(ctx, x + 6, y + 4, w - 12, 20, 8);
      ctx.fill();
      ctx.fillStyle = '#5b21b6';
      roundRectPath(ctx, x + 10, y + 26, w - 20, h - 34, 8);
      ctx.fill();
    } else if (id === 'tea_table' || id === 'cooking_counter' || id === 'archive_lectern') {
      ctx.fillStyle = '#2f2459';
      roundRectPath(ctx, x, y, w, h, 10);
      ctx.fill();
      ctx.strokeStyle = '#e5b963';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Porcelain teapot + cup or book
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(x + w * 0.38, y + h * 0.45, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(x + w * 0.65, y + h * 0.52, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'music_gramophone') {
      ctx.fillStyle = '#312054';
      roundRectPath(ctx, x + 10, y + 20, w - 20, h - 22, 8);
      ctx.fill();
      ctx.fillStyle = '#e5b963';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 18, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'fridge') {
      ctx.fillStyle = '#1e293b';
      roundRectPath(ctx, x, y - 18, w, h + 18, 10);
      ctx.fill();
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(x + 10, y + 14, 6, 18);
    } else if (id === 'stove' || id === 'pantry_cupboard' || id === 'kitchen_sink' || id === 'utensil_rack' || id === 'bath_sink' || id === 'bath_shelf') {
      ctx.fillStyle = '#252957';
      roundRectPath(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      if (id === 'stove') {
        // Two crystal blue burners + bubbling pot
        [x + w * 0.32, x + w * 0.68].forEach((bx) => {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.85)';
          ctx.beginPath();
          ctx.arc(bx, y + h * 0.45, 14, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(x + w * 0.32, y + h * 0.45, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === 'kitchen_sink' || id === 'bath_sink') {
        ctx.fillStyle = '#38bdf8';
        roundRectPath(ctx, x + 22, y + 14, w - 44, h - 28, 8);
        ctx.fill();
      }
    } else if (id === 'crystal_bathtub') {
      // Crystal clawfoot bathtub filled with warm shimmering water + snowdrop petals
      ctx.fillStyle = '#e2e8f0';
      roundRectPath(ctx, x, y, w, h, 26);
      ctx.fill();
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3;
      ctx.stroke();

      const waterGrad = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, w * 0.5);
      waterGrad.addColorStop(0, '#7dd3fc');
      waterGrad.addColorStop(1, '#312e81');
      ctx.fillStyle = waterGrad;
      roundRectPath(ctx, x + 12, y + 12, w - 24, h - 24, 20);
      ctx.fill();

      // Gentle steam / snowdrop petals
      for (let i = 0; i < 6; i++) {
        const px = x + 32 + i * 24 + Math.sin(nowSec * 1.4 + i) * 4;
        const py = y + 36 + ((i % 2) * 32);
        ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'balcony_telescope') {
      ctx.fillStyle = '#e5b963';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 26);
      ctx.lineTo(x + w / 2 - 18, y + h);
      ctx.moveTo(x + w / 2, y + 26);
      ctx.lineTo(x + w / 2 + 18, y + h);
      ctx.stroke();
      ctx.save();
      ctx.translate(x + w / 2, y + 24);
      ctx.rotate(-0.45);
      roundRectPath(ctx, -28, -8, 56, 16, 5);
      ctx.fill();
      ctx.restore();
    } else if (id === 'floating_crystal_orb') {
      const floatY = y + h / 2 + Math.sin(nowSec * 2.5) * 6;
      const g = ctx.createRadialGradient(x + w / 2, floatY, 4, x + w / 2, floatY, 46);
      g.addColorStop(0, 'rgba(196, 181, 253, 0.78)');
      g.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + w / 2, floatY, 46, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ddd6fe';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, floatY - 22);
      ctx.lineTo(x + w / 2 + 16, floatY);
      ctx.lineTo(x + w / 2, floatY + 22);
      ctx.lineTo(x + w / 2 - 16, floatY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawLeleCharacter(ctx, state, nowSec) {
    const p = state.player;
    const outfit = LELE_OUTFITS.find((o) => o.id === p.outfitId) || LELE_OUTFITS[0];
    const isSleep = p.pose === 'sleep';
    const isBathe = p.pose === 'bathe';
    const isSit = p.pose === 'sit' || p.pose === 'read' || p.pose === 'write';
    const walkSwing = p.isMoving ? Math.sin(p.walkPhase * 2) * 4 : 0;
    const bob = p.isMoving ? Math.abs(Math.sin(p.walkPhase * 2)) * -3 : Math.sin(nowSec * 2.6) * 1.3;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (isSleep) {
      // Lying cozy on the crystal bed facing up/side + floating Zzz
      ctx.fillStyle = outfit.secondary;
      ctx.beginPath();
      ctx.arc(-8, -14, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde6d8';
      ctx.beginPath();
      ctx.arc(-8, -12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(-8, -16, 11, Math.PI, Math.PI * 2);
      ctx.fill();

      // Floating "Zzz"
      ctx.fillStyle = 'rgba(221, 214, 254, 0.85)';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      const floatZ = (nowSec * 18) % 24;
      ctx.fillText('z', 14, -22 - floatZ * 0.6);
      ctx.fillText('Z', 24, -30 - floatZ);
      ctx.restore();
      return;
    }

    if (isBathe) {
      // Head & shoulders above crystal bath water
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, -8, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde6d8';
      ctx.beginPath();
      ctx.arc(0, -6, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = outfit.hairAccent;
      ctx.beginPath();
      ctx.arc(0, -13, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Soft character shadow on floor
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boots / Feet (animated walking stride unless seated)
    if (!isSit) {
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(-5, 11 + walkSwing * 0.45, 4.2, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(5, 11 - walkSwing * 0.45, 4.2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloak / Dress body
    ctx.fillStyle = outfit.primary;
    ctx.beginPath();
    ctx.moveTo(-12, 10 + bob);
    ctx.lineTo(-8, -6 + bob);
    ctx.lineTo(8, -6 + bob);
    ctx.lineTo(12, 10 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = outfit.secondary;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Crescent sash / trim
    ctx.fillStyle = outfit.trim;
    ctx.fillRect(-5, 1 + bob, 10, 3);

    // Hands & Activity Props
    ctx.fillStyle = '#fde6d8';
    ctx.beginPath();
    ctx.arc(-11, 2 + bob + walkSwing * 0.3, 3.3, 0, Math.PI * 2);
    ctx.arc(11, 2 + bob - walkSwing * 0.3, 3.3, 0, Math.PI * 2);
    ctx.fill();

    if (p.pose === 'read') {
      ctx.fillStyle = '#fef3c7';
      roundRectPath(ctx, -9, -1 + bob, 18, 12, 2);
      ctx.fill();
      ctx.strokeStyle = '#a78bfa';
      ctx.stroke();
    } else if (p.pose === 'cook' || p.pose === 'brew') {
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 1 + bob);
      ctx.lineTo(16, -9 + Math.sin(nowSec * 10) * 3);
      ctx.stroke();
    }

    // Head & Long Midnight-Violet Hair
    ctx.fillStyle = '#141236';
    ctx.beginPath();
    ctx.arc(0, -15 + bob, 13.5, 0, Math.PI * 2);
    ctx.fill();

    // Face skin (unless facing straight up)
    if (p.facing !== 'up') {
      const faceShiftX = p.facing === 'left' ? -3 : (p.facing === 'right' ? 3 : 0);
      ctx.fillStyle = '#fde6d8';
      ctx.beginPath();
      ctx.arc(faceShiftX, -13 + bob, 10.2, 0, Math.PI * 2);
      ctx.fill();

      // Violet eyes
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.arc(faceShiftX - 3.5, -13 + bob, 1.8, 0, Math.PI * 2);
      ctx.arc(faceShiftX + 3.5, -13 + bob, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hair bangs + Silver Crescent Hairpin
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -17 + bob, 12.5, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = outfit.hairAccent;
    ctx.beginPath();
    ctx.arc(-7, -23 + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawNearbyPrompt(ctx, obj, nowSec) {
    if (!obj) return;
    const cx = obj.x + obj.w / 2;
    const cy = Math.max(38, obj.y - 16 + Math.sin(nowSec * 4) * 2.5);
    const label = `[ E ] ${obj.actionLabel}`;

    ctx.save();
    // Highlight ring on object
    ctx.strokeStyle = 'rgba(221, 214, 254, 0.72)';
    ctx.lineWidth = 2;
    roundRectPath(ctx, obj.x - 4, obj.y - 4, obj.w + 8, obj.h + 8, 12);
    ctx.stroke();

    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    const textW = ctx.measureText(label).width;
    const pillW = textW + 22;
    const pillH = 26;
    const px = Math.max(12, Math.min(TOWER_WORLD_WIDTH - pillW - 12, cx - pillW / 2));

    roundRectPath(ctx, px, cy - pillH, pillW, pillH, 13);
    ctx.fillStyle = 'rgba(11, 15, 38, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, px + pillW / 2, cy - pillH / 2);
    ctx.restore();
  }

  function drawAtmosphericParticles(ctx, state, timeMeta, dtSec, nowSec) {
    // Update & render fireflies and crystal motes
    ctx.save();
    for (const f of fireflies) {
      f.x = (f.x + f.vx * dtSec + TOWER_WORLD_WIDTH) % TOWER_WORLD_WIDTH;
      f.y = (f.y + f.vy * dtSec + TOWER_WORLD_HEIGHT) % TOWER_WORLD_HEIGHT;
      const alpha = 0.25 + 0.55 * Math.abs(Math.sin(nowSec * 1.9 + f.phase));
      ctx.fillStyle = `rgba(253, 224, 71, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const m of crystalMotes) {
      m.y = (m.y + m.vy * dtSec + TOWER_WORLD_HEIGHT) % TOWER_WORLD_HEIGHT;
      const alpha = 0.2 + 0.4 * Math.sin(nowSec * 2.2 + m.phase);
      ctx.fillStyle = `rgba(196, 181, 253, ${Math.max(0.05, alpha).toFixed(2)})`;
      ctx.fillRect(m.x, m.y, m.r, m.r);
    }

    // Advance exterior weather particles every frame so windows & balcony stay animated
    if (state.weather === 'rain') {
      for (const drop of rainDrops) {
        drop.y = (drop.y + drop.vy * dtSec) % TOWER_WORLD_HEIGHT;
      }
      if (state.currentRoom === 'balcony') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineWidth = 1.1;
        for (const drop of rainDrops) {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 4, drop.y + drop.r);
          ctx.stroke();
        }
      }
    } else if (state.weather === 'snow') {
      for (const sf of snowFlakes) {
        sf.y = (sf.y + sf.vy * dtSec) % TOWER_WORLD_HEIGHT;
        sf.x = (sf.x + sf.vx * dtSec + TOWER_WORLD_WIDTH) % TOWER_WORLD_WIDTH;
      }
      if (state.currentRoom === 'balcony') {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.65)';
        for (const sf of snowFlakes) {
          ctx.beginPath();
          ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (state.weather === 'mist') {
      ctx.fillStyle = 'rgba(196, 181, 253, 0.08)';
      ctx.fillRect(0, 0, TOWER_WORLD_WIDTH, TOWER_WORLD_HEIGHT);
    }

    // Global time-of-day color wash
    ctx.fillStyle = timeMeta.ambientOverlay;
    ctx.fillRect(0, 0, TOWER_WORLD_WIDTH, TOWER_WORLD_HEIGHT);
    ctx.restore();
  }

  function renderFrame(canvas, state, nearbyObj, dtSec = 0.016) {
    if (!canvas || !state) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const room = TOWER_ROOMS[state.currentRoom];
    if (!room) return;
    const timeMeta = getTimeMeta(state.timeOfDay);
    const nowSec = performance.now() * 0.001;

    ctx.save();
    const scaleX = canvas.width / TOWER_WORLD_WIDTH;
    const scaleY = canvas.height / TOWER_WORLD_HEIGHT;
    ctx.scale(scaleX, scaleY);

    drawRoomArchitecture(ctx, room, state, timeMeta, nowSec);
    drawRoomDecorations(ctx, state, nowSec);

    // Draw room furniture sorted cleanly by bottom Y for convincing 3/4 depth
    const sortedObjs = [...room.objects].sort((a, b) => (a.y + a.h) - (b.y + b.h));
    let charDrawn = false;
    for (const obj of sortedObjs) {
      if (!charDrawn && state.player.y < obj.y + obj.h && obj.id !== 'tidy_rug') {
        drawLeleCharacter(ctx, state, nowSec);
        charDrawn = true;
      }
      drawFurnitureObject(ctx, obj, state, timeMeta, nowSec);
    }
    if (!charDrawn) {
      drawLeleCharacter(ctx, state, nowSec);
    }

    drawAtmosphericParticles(ctx, state, timeMeta, dtSec, nowSec);
    drawNearbyPrompt(ctx, nearbyObj, nowSec);

    ctx.restore();
  }

  return { renderFrame };
}
