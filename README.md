# 🎃 Pumpkin Workshop (3D Halloween Experience)

An interactive, atmospheric 3D Halloween WebGL web application built with **Three.js** and **Vite**. Carve your custom jack-o'-lantern in real-time, customize spooky candlelight flames, cast witch potions, and export high-resolution Halloween greeting cards!

Live Repository: [https://github.com/Utinax/pumpkin-workshop](https://github.com/Utinax/pumpkin-workshop)

---

## ✨ Features

- 🎃 **Procedural 3D Jack-o'-Lantern**: Double-sided hollow pumpkin mesh with realistic ribs, fluted stem, dynamic flickering candlelight, and interior flame shine-through cutouts.
- 🔪 **Real-Time 3D Carving Engine**:
  - Raycasts directly onto mesh UV coordinates.
  - 6 Sculpting Tools: Fine Knife, Serrated Saw, Broad Scoop, Skin Peel, Pumpkin Putty (repair), and Stencil Stamp.
  - 6 Ready-to-Carve Stencils: Classic Triangle Eyes, Wicked Smile, Bats, Screaming Ghost, Spider, and Crescent Moon.
  - Dynamic 3D Flying Pumpkin Shavings particle system.
  - Full Undo & Reset history stack.
- 🎯 **3D Surface Reticle Cursor**: Glowing orange targeting ring that dynamically hugs the pumpkin surface normal, showing exact cut thickness before carving.
- 🔄 **Smart Drag Controls**:
  - Drag directly on the pumpkin: carve into the flesh with debris and haptic feedback.
  - Drag on the empty graveyard background: rotate and inspect in 360° without mode switching.
- 🕯️ **Candle & Flame Customizer**: Choose between Classic Fire, Ghost Cyan, Witch's Green, Cursed Violet, and Blood Moon red flames, or blow the candle out!
- 🧪 **Witch's Cauldron Potion Bar**:
  - 🦇 Swarm of 3D flapping bats across the full moon.
  - 👻 Floating translucent ectoplasmic specters.
  - 🫧 Spooky toxic green ectoplasm fog.
  - ⚡ Midnight lightning storm with screen thunder.
  - 🐺 Mournful werewolf howl with moonlight surge.
  - 🎹 Deep gothic cathedral organ chords.
- 🍬 **Trick or Treat Minigame**: Interactive choice modal triggering a 3D candy shower or a ghostly jumpscare with haptic pulses.
- ⚡ **Awaken Soul Mode**: Pumpkin levitation, glowing aura, eerie lightning, and sinister voice speech synthesis.
- 📸 **Photo Booth & Greeting Card Generator**: Capture custom cards with spooky frames and messages. Supports instant PNG download and **1-click Copy to Clipboard**.
- 🔊 **Procedural Web Audio Synthesizer**: 100% synthesized sound effects (knife slicing, wind howling, candle extinguishing, organ chords, wolf howls) with zero external audio assets.
- 📱 **Fully Responsive Mobile Dock**: Optimized for phones and tablets (`100dvh`, `touch-action: none`, bottom dock for tools and full-screen carving).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/Utinax/pumpkin-workshop.git
cd pumpkin-workshop
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build

```bash
npm run build
```

The production assets will be generated in `dist/`.

---

## 🛠️ Tech Stack

- **Three.js** (r182) - 3D Scene, procedural geometry, lighting, particle simulation, and OrbitControls.
- **Vite** - Lightning-fast ES module dev server & rollup bundler.
- **Web Audio API** - Procedural sound synthesizer and ambient audio generator.
- **Web Speech API** - Real-time synthesized sinister voice lines.
- **Canvas 2D API** - Dynamic alpha carving texture mapping & photo card generator.

---

## 📄 License

MIT License. Happy Halloween! 🦇🎃
