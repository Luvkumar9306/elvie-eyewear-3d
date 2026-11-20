# ELVIE — Jimmy Fairly 3D Eyewear Showcase & Customizer

> A luxury, interactive 3D product landing page and customizer built for the retro oval silhouette **ELVIE** frames.

---

## 🌟 Features

* **Real-time 3D Product Stage:**
  * Procedurally modeled retro oval bio-acetate frames using **Three.js** and **OrbitControls**.
  * ACESFilmic tone mapping, PCF soft shadows, and dynamic environmental reflections.
* **Interactive 3D Customizer:**
  * Real-time switching between frame finishes (**Honey Amber**, **Tortoise**, **Obsidian**) and custom lens tints (**Warm Brown**, **Smoke Grey**, **Rose Gold**).
* **Scroll-Triggered Tour (GSAP + ScrollTrigger):**
  * **Hero:** Dynamic 3D stage and camera choreography.
  * **Anatomy / Specs:** Exploded view highlighting five-barrel metal hinges, rivets, and acetate craftsmanship.
  * **Lookbook:** Editorial lifestyle gallery with responsive cards.
  * **Pre-order:** Interactive reservation and order module.
* **Interactive Water Ripple Background:**
  * Dynamic fluid canvas distortion (`ripple-canvas`) tracking mouse movement.
* **Web Audio Sound Design:**
  * Custom synthesizer (`synth.js`) triggering procedural click and toggle feedback.

---

## 🛠️ Tech Stack

* **Three.js (r128)** & `OrbitControls`
* **GSAP 3** & `ScrollTrigger`
* **Vanilla HTML5 Canvas & CSS3**
* **Web Audio API**

---

## 🚀 Running Locally

Since this is a self-contained static web application, you can run any local static HTTP server:

```bash
# Using Python
python -m http.server 8080

# Or using npx
npx serve .
```

Then visit `http://localhost:8080` in your browser.
