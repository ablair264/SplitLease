Render pipeline scaffold (Blender + headless worker)

Overview
- This folder contains a minimal, production-friendly scaffold for rendering consistent, high‑quality car images using Blender.
- It is designed for batch/offline rendering on a GPU instance (local RTX or cloud) and outputs PNG/WebP hero shots for your site/CDN.

Contents
- render.py — Blender Python script: applies color/wheel variants, selects cameras and renders frames.
- config.sample.json — Example job config consumed by render.py.
- worker.Dockerfile — Container for headless renders (use with NVIDIA runtime).

How it works
1) You maintain a master Blender scene (.blend) with:
   - Cameras named e.g., CAM_FRONT34, CAM_SIDE, CAM_REAR34, etc.
   - A standardized light rig (HDRI + rim light) and a shadow catcher plane.
   - Collections/objects for wheel variants named predictably (e.g., WHEELS_19, WHEELS_20).
   - Paint materials named starting with PAINT (e.g., PAINT_BODY).
2) For each job, write a config JSON (see config.sample.json).
3) Run Blender in headless mode:
   blender -b /assets/scene.blend -P render.py -- --config /jobs/config.json
4) Files are written to the out_dir specified in the config.

Blender scene
- We cannot version a .blend here; store it in object storage and mount it at /assets/scene.blend when running renders.
- Keep cameras, materials and wheel collections named deterministically.

GPU container (worker.Dockerfile)
- Build: docker build -f worker.Dockerfile -t lease-render-worker .
- Run (with NVIDIA runtime):
  docker run --gpus all \
    -v $(pwd)/scripts/render:/render \
    -v /path/to/scene:/assets \
    -v /path/to/jobs:/jobs \
    lease-render-worker blender -b /assets/scene.blend -P /render/render.py -- --config /jobs/config.json

Notes
- Eevee for speed (good for web hero shots). Switch to Cycles for photoreal (slower).
- Output to PNG (RGBA) for transparent background; convert to WebP/AVIF at CDN or in a post-step.
- Add a small queue/worker to parallelize jobs if needed.

