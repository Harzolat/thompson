# Portfolio images

Drop real image files here. Until a file exists, keep its data field
as `null` — every section renders a designed placeholder instead, so
nothing ever shows a broken image.

If a path is set but the file is missing (or fails to load), the
components also fall back to the placeholder automatically via `onError`.

## Slots

| File               | Section | Data field to set                     | Suggested size / notes                              |
| ------------------ | ------- | ------------------------------------- | --------------------------------------------------- |
| `thompson.jpg`     | About   | `about.visual.image` in `site.js`     | Portrait, 4:5 (e.g. 1200×1500). Grayscale-friendly. |
| `about-photo.jpg`  | About   | Reserved secondary About image        | Not consumed yet — for a future second frame.       |
| `hero-visual.jpg`  | Hero    | `hero.visual.image` in `site.js`      | Wide artwork, 4:3 (e.g. 1600×1200). Above the fold. |
| `pulselab.jpg`     | PulseLab| Reserved community artwork            | Not consumed yet — the node visual stays primary.   |
| `pulselab-logo.png`| Brand   | `community.logo` in `site.js`         | Transparent mark, used in navbar/PulseLab/footer. |
| `logos/react.svg`, `logos/javascript.svg`, `logos/typescript.svg`, `logos/nodedotjs.svg`, `logos/vite.svg` | Hero | `heroMarquee` in `site.js` | Logo + label marquee strip. Monochrome marks (Simple Icons, ink `#0a0a0a` fill) — the dark theme inverts them via CSS. Discipline items (AI Tools, Automation...) use lucide icons instead of files. |
| `project-1.jpg`    | Work    | `projects[0].image` in `projects.js`  | 16:10 (e.g. 1600×1000). Empty — Marywine uses the placeholder. |
| `project-2.jpg`    | Work    | `projects[1].image` in `projects.js`  | Stayflow uses `stayflow.jpg` instead (see below).                     |
| `project-3.jpg`    | Work    | `projects[2].image` in `projects.js`  | Marv Collection uses `marv-collection.jpg` instead (see below).       |

## Filled slots

| File                   | Used by              | Notes                                              |
| ---------------------- | -------------------- | -------------------------------------------------- |
| `portrait.jpg`         | Hero portrait        | His real photo, wired as `hero.portrait` in `site.js`. B&W, hairline-framed, eager-loaded. |
| `marv-collection.jpg`  | Marv Collection cover| Hero screenshot, wired as long banner in `projects.js`. |
| `marv-collection-2..5` | Reserved gallery set | `-2` wired as the hover-box shot; rest unwired until gallery UI. |
| `stayflow.jpg`         | Stayflow cover       | Hero screenshot, wired as long banner in `projects.js`. |
| `stayflow-2.jpg`       | Reserved gallery set | Featured-hotels view, wired as the hover-box shot.  |
| `marywine.jpg`         | Marywine cover       | Hero screenshot, wired as long banner + featured.   |
| `marywine-2.jpg`       | Marywine hover box   | Signature-services view, wired as previewImage.     |
| `marywine-3.jpg`       | Reserved gallery set | CTA banner view; unwired until gallery UI.          |

## Rules for every image

- Meaningful `alt` text (`imageAlt` fields) — except purely decorative
  artwork, which stays hidden from assistive tech.
- `object-fit: cover` inside a fixed-aspect container (no layout shift).
- Lazy-load below-the-fold images; the Hero image loads eagerly.
- Keep files web-optimized (JPG ~80% quality, or WebP).
