# Trey TV 4K UI Artwork Pack

All images are **4K UHD 3840 × 2160** in a 16:9 aspect ratio.

## Folder structure

- `assets_4k_jpg/` — final 4K high-quality artwork files
- `metadata/` — sidecar JSON metadata for every asset
- `manifest.json` — full metadata manifest
- `PLACEMENT_MAP.md` — quick implementation map

## Usage

These are clean title/placement graphics only. They contain no app UI screenshots, no old concept-dashboard labels, no fake buttons, and no app logos.

Recommended CSS:

```css
background-size: cover;
background-position: center center;
object-fit: cover;
object-position: center center;
```

Use each file according to the `designated_location`, `target_id`, and `recommended_app_path` in its metadata.
