# Thompson Harzolat × PulseLab — Portfolio

Personal portfolio for **Thompson Harzolat** — developer, creator and founder of
**PulseLab**, a technology and creative community.

Built with React + Vite. No animation libraries, no 3D libraries, no backend.

## Run it

```bash
npm install
npm run dev      # local preview
npm run build    # production build in dist/
npm run lint     # static checks
```

## Edit content

- Personal info, nav, socials and every section's copy: `src/data/site.js`
- Projects: `src/data/projects.js` (set `image` to a path in `public/` to show a screenshot, or keep `null` for the abstract placeholder)
- Styles and design tokens: `src/index.css`
- One component per section: `src/components/`

## Before launch

Replace the placeholder contact details in `src/data/site.js`:

- `email` (`tomiwaazeez019@gmail.com`) and `public/resume.pdf` (real 3-page resume) are live
- `socials` URLs (currently generic homepages)
- Sample projects in `src/data/projects.js` with real work

After deploying, add the production URL to `index.html`
(`og:url`, `og:image`, canonical).
