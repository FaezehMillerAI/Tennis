# 🎾 LTA Coach Studio 3D

> **Photorealistic 3D Interactive Tennis Court & Tactical Lesson Designer**  
> Built according to the official **British Lawn Tennis Association (LTA)** coaching curriculum and the **4-Tier Hourglass Lesson Framework**.

---

## 🌟 Highlights & Features

### 1. Photorealistic 3D Tennis Court Engine (Three.js WebGL)
- **5 Authentic Grand Slam Surfaces:**
  - 🌿 **Wimbledon Grass:** Alternating lawn mower stripes, natural turf physics, white chalk lines.
  - 🧱 **Roland Garros Clay:** Rich terracotta brick-dust grain, baseline slide marks, white line tapes.
  - 🎾 **US Open Hard Court:** DecoTurf deep royal blue interior with forest green surround.
  - 🌊 **Australian Open:** Bright Pacific blue double-tone acrylic finish.
  - 🏢 **Indoor Carpet:** Modern dark graphite court with stadium reflections.
- **Regulation 3D Net with Center Sag:**
  - 3.5 ft (1.07m) height at net posts, dropping smoothly to 3.0 ft (0.914m) at the center strap.
  - Semi-transparent net mesh, top vinyl cord band, and center anchor strap.
- **3D Camera Presets & Orbit Controls:**
  - 🎥 **3D Broadcast View:** Grandstand TV broadcast camera perspective.
  - 🎾 **Behind Baseline POV:** Player's perspective looking over the net cord.
  - 📐 **Top-Down 2D Tactical View:** Orthographic view for geometric drill diagramming.
  - ⚡ **Net Approach View:** Low-angle close-up for volleys and transition drills.
  - Smooth orbit rotation (drag mouse/touch), pan (right-click / two-finger), and zoom (scroll/pinch).
- **Stadium Lighting Mode:**
  - Toggle between **Day Sun** (soft ambient daylight) and **Night Session** (stadium floodlights with dynamic court reflections).

### 2. 3D Parabolic Ball Trajectories with True Net Clearance
- Quadratic Bézier arcs that curve realistically in 3D space, clearing the net cord at realistic heights (1.8m flat vs. 2.7m heavy topspin clearance) and landing on designated target spots.
- 3D Player movement vectors (dashed arrows along the court floor).
- 3D Coach feed arcs with balls at origin.
- 3D Shaded landing target zones.

### 3. Raycast 3D Drag & Drop Equipment
- 3D Tennis Players (P1 Blue, P2 Red, P3 Purple with direction indicators and rackets).
- 3D LTA Coach (Teal & Gold jacket with clipboard).
- 3D Tennis Balls (high-optic yellow felt with seams).
- 3D Ball Hopper / Basket (metal wireframe with tennis balls inside).
- 3D Training Cones (orange & yellow cones with reflective white bands).
- 3D Target Discs (+5, +10, +15 points).
- 3D Agility Ladder for footwork routines.

### 4. Official LTA 4-Tier Hourglass Lesson Framework
Directly incorporating the official LTA lesson structure:
1. **Tier 1: Game Assessment** (Live match context to diagnose technical/tactical priority).
2. **Tier 2: Demo / Teaching Closed** (Clear visual demo, action cues, and closed repetitive feeding).
3. **Tier 3: Progressing Open** (Dynamic rallies, variability, movement, and tactical decision-making).
4. **Tier 4: Game** (Competitive match play, bonus scoring, and player debrief).

### 5. AI Smart Lesson Generator
- Generates accredited 4-tier LTA coaching plans with tactical cues, diagrams, and progressions for any age, level, and situation in seconds.

### 6. Print-Ready A4 Coaching Card
- One-click export to a clean, professional A4 PDF coaching sheet complete with high-resolution 3D court diagram snapshots.

---

## 🌐 Live Web Application (GitHub Pages)

Experience the live 3D application on GitHub Pages:  
👉 **[https://faezehmillerai.github.io/Tennis/](https://faezehmillerai.github.io/Tennis/)**

---

## 💻 Local Development

No build tools or node packages required. Simply open `index.html` in any modern web browser or run:

```bash
python3 serve.py
```
And navigate to `http://localhost:8080`.

