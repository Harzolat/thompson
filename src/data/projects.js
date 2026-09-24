// Real projects — synced from github.com/Harzolat (public repos).
// Titles, descriptions, tech and years come straight from the repos;
// nothing here is invented. To refresh: compare with the GitHub API
// (GET /users/Harzolat/repos) and update fields below.
//
// Each project supports: id, number, title, description, category,
// role, tech (list), year, image (path or null), imageAlt, link,
// plus optional demo, repo and highlights — rendered only when set,
// so empty fields never produce dead buttons or invented claims.
//
// - image: the LONG banner + featured visual. previewImage: the SMALL
//   hover-box card (falls back to image when unset). Same project,
//   different shots — e.g. hero shot long, detail shot on hover.
//   Set it to a slot from public/images and the real image appears
//   automatically. A set-but-missing file falls back instead of breaking.
// - demo / repo: full URLs. Rendered as Live Demo / Source Code
//   buttons only when present.
// - highlights: 2–3 short, TRUE strings about the project.
// - link: fallback destination when neither demo nor repo exists.
// - Case-study narrative (all optional, render only when set):
//   overview, challenge, solution: short truthful strings;
//   results: list of verified outcomes. Leave unset until you have
//   real copy — empty sections never render.

export const projects = [
  {
    id: 'marywine-catering-events',
    number: '01',
    title: 'Marywine Catering & Events',
    description: 'A responsive website for catering and events.',
    category: 'Website',
    role: 'Design + Build',
    tech: ['JavaScript', 'CSS'],
    year: '2026',
    image: '/images/marywine.jpg',
    imageAlt: 'Marywine Catering and Events website — hero with buffet showcase',
    previewImage: '/images/marywine-2.jpg',
    previewImageAlt: 'Marywine Catering and Events website — signature services',
    gallery: [
      { src: '/images/marywine.jpg', alt: 'Marywine Catering and Events website — hero with buffet showcase' },
      { src: '/images/marywine-2.jpg', alt: 'Marywine Catering and Events website — signature services' },
      { src: '/images/marywine-3.jpg', alt: 'Marywine Catering and Events website — event call to action' },
    ],
    highlights: [
      'Custom catering menu configurator & booking flow',
      'Fully responsive design optimized for mobile order placements',
    ],
    link: 'https://marywine-catering-and-events.vercel.app',
    demo: 'https://marywine-catering-and-events.vercel.app',
    repo: 'https://github.com/Harzolat/Marywine-Catering-and-Events',
  },
  {
    id: 'stayflow',
    number: '02',
    title: 'Stayflow',
    description: 'A responsive website for finding nearby hotels, booking and more.',
    category: 'Concept',
    role: 'Concept',
    tech: [],
    year: '2026',
    image: '/images/stayflow.jpg',
    imageAlt: 'Stayflow hotel booking website — find your next stay hero',
    previewImage: '/images/stayflow-2.jpg',
    previewImageAlt: 'Stayflow hotel booking website — featured hotels',
    link: 'https://github.com/Harzolat/Stayflow',
    demo: null,
    repo: 'https://github.com/Harzolat/Stayflow',
    highlights: [
      'Hotel & accommodation search with real-time location filtering',
      'Clean, intuitive UI designed for seamless booking workflows',
    ],
  },
  {
    id: 'marv-collection',
    number: '03',
    title: 'Marv Collection',
    description: 'A clothing website suitable for ordering and quoting.',
    category: 'Website',
    role: 'Design + Build',
    tech: ['TypeScript', 'CSS'],
    year: '2026',
    image: '/images/marv-collection.jpg',
    imageAlt: 'Marv Collection fashion website homepage — Soft Minimalism hero',
    previewImage: '/images/marv-collection-2.jpg',
    previewImageAlt: 'Marv Collection fashion website — collection grid',
    link: 'https://github.com/Harzolat/Marv.-Collection',
    demo: null,
    repo: 'https://github.com/Harzolat/Marv.-Collection',
    highlights: [
      'E-commerce style catalog with dynamic quote request system',
      'Responsive grid layout tailored for modern apparel showcase',
    ],
  },
];
