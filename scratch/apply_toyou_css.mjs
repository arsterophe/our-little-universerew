import fs from 'fs';

let css = fs.readFileSync('universes.css', 'utf8');

// 1. Replace .toyou-hud-topright and .toyou-quick-menu block
const targetTopRightBlock = `/* --- TOP-RIGHT HUD: GREETING PILL & QUICK LOCATION DIRECTORY --- */
.toyou-hud-topright {
  position: absolute;
  top: 1.2%;
  right: 1.2%;
  width: 15.8%;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.85rem;
}

.toyou-user-pill {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.22rem 0.75rem 0.22rem 0.28rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #4e726c 0%, #60867e 100%);
  border: 1.5px solid rgba(254, 240, 138, 0.72);
  box-shadow: 0 8px 20px rgba(20, 44, 42, 0.36);
}

.toyou-user-avatar {
  width: clamp(26px, 2.9vw, 36px);
  height: clamp(26px, 2.9vw, 36px);
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #fef08a;
  flex-shrink: 0;
}

.toyou-user-greeting {
  font-family: 'Cormorant Garamond', 'Plus Jakarta Sans', serif;
  font-size: clamp(0.8rem, 1.08vw, 1.08rem);
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
}

.toyou-user-sparkle {
  color: #fef08a;
  font-size: 0.85rem;
}

/* Quick Directory Card ("Mau ke mana dulu, Lala?") */
.toyou-quick-menu {
  width: 76%;
  box-sizing: border-box;
  padding: 0.65rem 0.5rem;
  border-radius: 15px;
  background: linear-gradient(160deg, #4a6c62 0%, #587c70 100%);
  border: 1.5px solid rgba(254, 240, 138, 0.62);
  box-shadow: 0 12px 26px rgba(18, 42, 38, 0.42);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.32rem;
}

.toyou-quick-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(0.56rem, 0.72vw, 0.7rem);
  font-weight: 700;
  color: #fef9c3;
  text-align: center;
  margin: 0 0 0.2rem;
  line-height: 1.22;
}

.toyou-quick-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.26rem 0.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(254, 240, 138, 0.26);
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(0.5rem, 0.64vw, 0.64rem);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.22s ease;
}

.toyou-quick-item .q-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(254, 240, 138, 0.24);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  flex-shrink: 0;
}

.toyou-quick-item:hover,
.toyou-quick-item.active-nav {
  background: rgba(254, 240, 138, 0.28);
  border-color: #fef08a;
  transform: translateX(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.22);
}`;

const replacementTopRightBlock = `/* --- TOP-RIGHT HUD: RETURN BUTTON, STORY PILL & GREETING PILL (LALA — TO YOU) --- */
.toyou-hud-topright {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.toyou-user-pill {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.28rem 0.85rem 0.28rem 0.35rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(56, 92, 80, 0.95) 0%, rgba(76, 116, 104, 0.95) 100%);
  border: 1.5px solid rgba(254, 240, 138, 0.72);
  box-shadow: 0 8px 20px rgba(20, 44, 42, 0.36);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.toyou-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #fef08a;
  flex-shrink: 0;
}

.toyou-user-greeting {
  font-family: 'Cormorant Garamond', 'Plus Jakarta Sans', serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
}

.toyou-user-sparkle {
  color: #fef08a;
  font-size: 0.85rem;
}

/* Quick Star Messages / Location Pill under Character Card (Matching Nyanya Layout) */
.toyou-quick-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(46, 78, 68, 0.9) 0%, rgba(68, 106, 94, 0.88) 100%);
  border: 1.2px solid rgba(254, 240, 138, 0.55);
  color: #fef9c3;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s ease;
  margin-top: 8px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 14px rgba(12, 32, 26, 0.45);
}

.toyou-quick-pill:hover {
  background: linear-gradient(135deg, rgba(72, 112, 98, 0.98) 0%, rgba(94, 140, 126, 0.98) 100%);
  border-color: #fde047;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(254, 240, 138, 0.5);
}

/* --- BOTTOM-RIGHT: FLOATING QUICK NAVIGATION DOCK (LALA — TO YOU) --- */
.toyou-quick-nav-dock {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(38, 68, 58, 0.9) 0%, rgba(56, 92, 80, 0.88) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.2px solid rgba(254, 240, 138, 0.55);
  box-shadow: 0 8px 24px rgba(12, 32, 26, 0.55), 0 0 14px rgba(254, 240, 138, 0.25);
  box-sizing: border-box;
}

.toyou-dock-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(254, 240, 138, 0.35);
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.toyou-dock-btn:hover,
.toyou-dock-btn.active-nav {
  background: linear-gradient(135deg, rgba(254, 240, 138, 0.35) 0%, rgba(244, 114, 182, 0.3) 100%);
  border-color: #fde047;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(254, 240, 138, 0.4);
}

.toyou-dock-btn .q-icon {
  font-size: 0.85rem;
}`;

if (css.includes(targetTopRightBlock)) {
  css = css.replace(targetTopRightBlock, replacementTopRightBlock);
  console.log('✅ Replaced targetTopRightBlock in universes.css');
} else {
  console.error('targetTopRightBlock not found in universes.css');
  process.exit(1);
}

// 2. Replace .toyou-bottom-quote and .toyou-back-btn block with .toyou-mood-container
const targetBottomBlock = `/* Bottom-Left Quote & Bottom-Right Back Button */
.toyou-bottom-quote {
  display: none;
}

.toyou-bottom-quote span {
  color: #fef08a;
  font-style: normal;
}

.toyou-back-btn {
  position: absolute;
  right: 1.2%;
  bottom: 1.8%;
  width: 15.8%;
  height: 6.6%;
  z-index: 22;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #486c60 0%, #5c8476 100%);
  border: 1.5px solid rgba(254, 240, 138, 0.75);
  color: #ffffff;
  font-family: 'Cormorant Garamond', 'Plus Jakarta Sans', serif;
  font-size: clamp(0.72rem, 0.94vw, 0.95rem);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(18, 42, 36, 0.45);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.toyou-back-btn:hover {
  transform: translateY(-2px);
  border-color: #fde047;
  background: linear-gradient(135deg, #568072 0%, #6c9888 100%);
  box-shadow: 0 10px 26px rgba(18, 42, 36, 0.6), 0 0 18px rgba(254, 240, 138, 0.65);
}`;

const replacementBottomBlock = `/* --- BOTTOM-LEFT: MOOD & REKOMENDASI MUSIK CARD (LALA — TO YOU) --- */
.toyou-mood-container {
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 35;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100vw - 120px);
}

.toyou-mood-music-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.85rem 0.5rem 0.65rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(38, 68, 58, 0.92) 0%, rgba(56, 92, 80, 0.88) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.2px solid rgba(254, 240, 138, 0.55);
  box-shadow: 0 8px 24px rgba(12, 32, 26, 0.55), 0 0 14px rgba(254, 240, 138, 0.25);
  box-sizing: border-box;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toyou-mood-music-card:hover {
  border-color: #fde047;
  box-shadow: 0 10px 28px rgba(12, 32, 26, 0.65), 0 0 18px rgba(254, 240, 138, 0.45);
}

.toyou-mood-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(254, 240, 138, 0.35) 0%, rgba(244, 114, 182, 0.2) 70%);
  border: 1px solid rgba(254, 240, 138, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(254, 240, 138, 0.45);
  flex-shrink: 0;
}

.toyou-mood-sun-icon {
  font-size: 0.95rem;
}

.toyou-mood-details {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.toyou-mood-header-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 500;
  color: #fef08a;
}

.toyou-mood-state-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.toyou-mood-state-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
}

.btn-toggle-toyou-mood-picker {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(254, 240, 138, 0.45);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fef08a;
  cursor: pointer;
  padding: 0;
  font-size: 0.62rem;
  transition: all 0.2s ease;
  line-height: 1;
}

.btn-toggle-toyou-mood-picker:hover {
  background: rgba(254, 240, 138, 0.3);
  border-color: #ffffff;
  transform: scale(1.15);
}

.btn-toggle-toyou-mood-picker.is-active .picker-caret-icon {
  transform: rotate(180deg);
}

.toyou-mood-song-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.62rem;
  color: #fed7aa;
  letter-spacing: 0.02em;
}

.toyou-mood-play-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #ec4899 100%);
  border: 1px solid rgba(254, 240, 138, 0.7);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.55);
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.toyou-mood-play-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 18px rgba(254, 240, 138, 0.85);
}

/* --- HORIZONTAL MOOD OPTIONS BAR (TO YOU) --- */
.toyou-mood-options-bar {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background: linear-gradient(135deg, rgba(32, 58, 50, 0.95) 0%, rgba(48, 82, 72, 0.93) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1.2px solid rgba(254, 240, 138, 0.55);
  box-shadow: 0 8px 24px rgba(10, 28, 22, 0.65), 0 0 20px rgba(254, 240, 138, 0.25);
  border-radius: 999px;
  opacity: 0;
  transform: translateX(-12px) scale(0.96);
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  overflow-x: auto;
  max-width: calc(100vw - 320px);
  white-space: nowrap;
}

.toyou-mood-options-bar::-webkit-scrollbar {
  display: none;
}

.toyou-mood-options-bar.is-open {
  display: flex;
  opacity: 1;
  transform: translateX(0) scale(1);
  pointer-events: auto;
}

.toyou-mood-option-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 5px 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.74rem;
  font-weight: 500;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.toyou-mood-option-pill:hover {
  background: rgba(254, 240, 138, 0.3);
  border-color: #fde047;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(254, 240, 138, 0.35);
}

.toyou-mood-option-pill.active {
  background: linear-gradient(135deg, rgba(254, 240, 138, 0.45) 0%, rgba(244, 114, 182, 0.45) 100%);
  border-color: #fef08a;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(254, 240, 138, 0.5);
}`;

if (css.includes(targetBottomBlock)) {
  css = css.replace(targetBottomBlock, replacementBottomBlock);
  console.log('✅ Replaced targetBottomBlock in universes.css');
} else {
  console.error('targetBottomBlock not found in universes.css');
  process.exit(1);
}

// 3. Update .toyou-location-panel positioning so it opens on the right side (matching Nyanya)
const oldPanelPos = `.toyou-location-panel {
  position: absolute;
  left: 1.5%;
  bottom: 8.8%;
  width: 345px;`;

const newPanelPos = `.toyou-location-panel {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 350px;`;

if (css.includes(oldPanelPos)) {
  css = css.replace(oldPanelPos, newPanelPos);
  console.log('✅ Updated .toyou-location-panel position to right: 20px; bottom: 20px;');
} else {
  console.error('oldPanelPos not found in universes.css');
  process.exit(1);
}

fs.writeFileSync('universes.css', css, 'utf8');
console.log('🎉 Successfully updated universes.css for TO YOU (Lala)!');
