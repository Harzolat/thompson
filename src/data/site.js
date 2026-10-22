// Central place for personal info.
// Edit these values — every section reads from here.

export const site = {
  name: 'Thompson Harzolat',
  shortName: 'Thompson',
  roles: ['Founder', 'Creator', 'Developer'],
  roleTitle: 'Full-Stack Frontend Developer & UI/UX Designer',

  // ---- Hero copy (edit the hero text here) ----
  tagline: 'Building ideas into digital experiences.',
  description:
    'I design and build digital experiences, products and communities through code, creativity and experimentation.',
  status: 'Available for full-time & freelance roles',
  heroStats: [
    { value: '4+', label: 'Years Experience' },
    { value: '90+', label: 'Lighthouse Vitals Target' },
    { value: '100%', label: 'Mobile Responsive & Accessible' },
  ],

  // Hero logo + label marquee (under the stats): what Thompson does plus
  // the tools he actually uses — confirmed against the capabilities
  // badges and his own stack. `icon` keys map to lucide icons in
  // LogoMarquee.jsx; `src` files are monochrome svgs in
  // public/images/logos/ (ink fill, inverted in the dark theme).
  // Items with an `href` link out; the rest are plain text.
  heroMarquee: [
    { id: 'ai', label: 'AI Tools', icon: 'ai' },
    {
      id: 'react',
      label: 'React',
      src: '/images/logos/react.svg',
      href: 'https://react.dev',
    },
    { id: 'automation', label: 'Automation', icon: 'automation' },
    {
      id: 'typescript',
      label: 'TypeScript',
      src: '/images/logos/typescript.svg',
      href: 'https://www.typescriptlang.org',
    },
    { id: 'frontend', label: 'Frontend Development', icon: 'code' },
    {
      id: 'javascript',
      label: 'JavaScript',
      src: '/images/logos/javascript.svg',
      href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    },
    { id: 'design', label: 'UI/UX Design', icon: 'pen' },
    {
      id: 'nodejs',
      label: 'Node.js',
      src: '/images/logos/nodedotjs.svg',
      href: 'https://nodejs.org',
    },
    { id: 'interactive', label: 'Interactive Experiences', icon: 'interactive' },
    {
      id: 'vite',
      label: 'Vite',
      src: '/images/logos/vite.svg',
      href: 'https://vite.dev',
    },
  ],

  // ---- Hero scroll artwork (edit the card copy here) ----
  // Set visual.image to a path like '/images/hero-visual.jpg' (file in
  // public/) to show real artwork; null keeps the designed placeholder.
  hero: {
    // His real photo (file in public/images/); null hides the slot.
    portrait: {
      src: '/images/portrait.jpg',
      alt: 'Portrait of Thompson Harzolat',
    },
    visual: {
      sandbox: 'preview.pulse.lab',
      sandboxBadge: 'Interactive Sandbox',
      codeLine: '<Digital Experiences />',
      codeSub: 'Performant interfaces, creative code and experimentation.',
      badges: ['React', 'JavaScript', 'PulseLab'],
      stack: 'Stack — React · JavaScript',
      footRight: 'PulseLab',
      caption: 'Selected visual study — scroll',
      image: null,
      imageAlt: '',
    },
  },

  // ---- About copy (edit the about text here) ----
  about: {
    label: '01 / About',
    heading: 'Behind the builds.',
    statement: 'I like turning ideas into things people can',
    statementAccent: 'actually experience.',
    paragraphs: [
      'I’m Thompson — a developer and creative builder. I enjoy working with programming and technology, from web experiences and interfaces to experiments with AI and emerging tools.',
      'Right now I’m building PulseLab: a community and creative space where ideas, code and experimentation turn into real projects.',
    ],
    // Set image to '/images/thompson.jpg' (file in public/images/) to show
    // a real portrait; null keeps the designed profile card.
    image: null,
    imageAlt: 'Portrait of Thompson Harzolat',
    card: {
      name: 'Thompson Harzolat',
      role: 'Creator · Developer',
      badges: ['React.js', 'JavaScript', 'TypeScript', 'Node.js'],
      building: 'Building PulseLab',
    },
    actions: {
      resumeLabel: 'Download Resume',
      stackLabel: 'View Stack',
      stackHref: '#skills',
    },
    metrics: [
      { value: '05+', label: 'Years Exp.' },
      { value: '10+', label: 'Projects' },
      { value: '01', label: 'Community' },
    ],
  },

  // ---- PulseLab copy (edit the community text here) ----
  pulseLab: {
    label: '02 / PulseLab',
    kicker: 'Ideas need a place to grow.',
    title: 'PulseLab',
    statement: 'A place for ideas, code and experimentation.',
    description:
      'PulseLab is a technology and creative community founded by Thompson Harzolat — focused on programming, software development, AI, digital products and experimentation.',
    founder: 'Founded by Thompson Harzolat',
    // Spotlight points at a real section — update text/href together.
    spotlight: {
      label: 'Now in the lab',
      text: 'Structural Study',
      href: '#creative',
    },
    // Points at the dedicated /pulselab route.
    cta: { label: 'Explore PulseLab', href: '/pulselab' },
    pillars: [
      {
        name: 'Build',
        items: ['Programming', 'Software development', 'Web experiences'],
      },
      {
        name: 'Explore',
        items: ['AI', 'Emerging technology', 'Experimentation'],
      },
      {
        name: 'Create',
        items: ['Digital products', 'Creative technology', 'Interfaces'],
      },
      {
        name: 'Connect',
        items: ['Community', 'Learning', 'Collaboration'],
      },
    ],
  },

  // ---- Capabilities copy (edit the skills text here) ----
  capabilities: {
    label: '04 / Capabilities',
    statement: 'I build at the intersection of code, design and ideas.',
    note: 'What I can make — not a scoreboard of everything I’ve touched.',
    items: [
      {
        name: 'Build',
        points: [
          'Frontend development',
          'Web applications',
          'Interactive experiences',
          'Digital interfaces',
        ],
        // Only tools Thompson actually uses — do not add names here
        // without confirmation.
        badges: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
        tiles: [
          { icon: 'code', label: 'Frontend' },
          { icon: 'app', label: 'Web apps' },
          { icon: 'interactive', label: 'Interactive' },
        ],
      },
      {
        name: 'Design',
        points: [
          'UI / UX',
          'Visual systems',
          'Digital identity',
          'Interface thinking',
        ],
        badges: [],
        tiles: [
          { icon: 'pen', label: 'UI / UX' },
          { icon: 'layers', label: 'Systems' },
          { icon: 'identity', label: 'Identity' },
        ],
      },
      {
        name: 'Explore',
        points: [
          'Artificial intelligence',
          'Creative technology',
          'Emerging tools',
          'Experiments',
        ],
        badges: [],
        tiles: [
          { icon: 'ai', label: 'AI' },
          { icon: 'experiment', label: 'Experiments' },
          { icon: 'tools', label: 'New tools' },
        ],
      },
      {
        name: 'Connect',
        points: [
          'Communities',
          'Digital platforms',
          'Collaboration',
          'Knowledge sharing',
        ],
        badges: [],
        tiles: [
          { icon: 'community', label: 'Community' },
          { icon: 'sharing', label: 'Sharing' },
          { icon: 'platforms', label: 'Platforms' },
        ],
      },
    ],
  },

  // ---- Journey copy (edit the journey text here) ----
  journey: {
    label: '05 / Journey',
    statement: 'Curiosity became craft.',
    intro:
      'What started with an interest in technology grew into a practice of building, designing and experimenting — and creating spaces for other people to learn and build too.',
    milestones: [
      {
        number: '01',
        title: 'Curiosity',
        period: 'The beginning',
        date: '2021',
        description:
          'An interest in computers, design and how digital things work — and the urge to understand what’s behind the screen.',
        tags: ['Discovery', 'Fundamentals'],
      },
      {
        number: '02',
        title: 'Making',
        period: 'Learning by building',
        date: '2022 – 2023',
        description:
          'Moving from using technology to creating with it: writing code, designing interfaces, finishing small projects and learning from each one.',
        tags: ['First builds', 'Iteration'],
      },
      {
        number: '03',
        title: 'Exploring',
        period: 'Code × design × AI',
        date: '2024',
        description:
          'Going beyond basic web development into AI, creative technology and new tools — experimenting to see what’s possible.',
        tags: ['AI', 'Creative tech'],
      },
      {
        number: '04',
        title: 'Building community',
        period: 'PulseLab',
        date: '2025',
        description:
          'Starting PulseLab: a space where people can build, explore, share knowledge and grow together instead of learning alone.',
        tags: ['PulseLab', 'Community'],
      },
      {
        number: '05',
        title: 'What’s next',
        period: 'In progress',
        date: '2026 – Present',
        description:
          'Still learning, still building, still experimenting. The journey stays open — new ideas, projects and collaborations to come.',
        tags: ['Learning', 'Building'],
      },
    ],
  },
  // ---- Creative copy (edit the creative section text here) ----
  creative: {
    label: '06 / Creative',
    statement: 'Some ideas need to be experienced.',
    intro:
      'A small experiment from the intersection of code, design and curiosity — a structural study you can turn over in your hands.',
    instruction: {
      explore: 'Move to explore',
      reconfigure: 'Click to reconfigure',
    },
    closing: 'Still experimenting.',
    studies: ['Study 01 — Structure', 'Study 02 — Tension', 'Study 03 — Balance'],
  },
  // ---- Contact copy (edit the contact text here) ----
  // Email + socials are read from the top-level email / socials fields,
  // so contact details live in exactly one place.
  contact: {
    label: '07 / Contact',
    statement: 'Let’s make something worth building.',
    intro:
      'Have an idea, a project, a collaboration — or simply something interesting to discuss? I’m open to thoughtful conversations.',
    ctaLabel: 'Start a conversation',
    availabilityLabel: 'Open to',
    availability: [
      'Digital products',
      'Creative development',
      'Collaborations',
      'PulseLab / Community',
    ],
  },
  // ---- Footer content (edit the footer copy here) ----
  footer: {
    marquee: ['Thompson Harzolat', 'PulseLab', 'Design', 'Code', 'Community', 'Experiments'],
    headline: 'Have an idea in mind?',
    emailCta: 'Start a conversation',
    pulselabCta: 'Explore PulseLab',
    badge: 'Designed + built by Thompson',
    giant: 'Thompson',
  },
  // ---- Header resume (edit when the real PDF is ready) ----
  // Drop the finished file at public/resume.pdf — same filename keeps
  // every link working with no code changes.
  resume: { label: 'Resume', href: '/resume.pdf', fileName: 'Thompson-Harzolat-Resume.pdf' },
  email: 't.harzolat019@gmail.com',
  community: {
    name: 'PulseLab',
    statement: 'A community where ideas, code and creativity become real things.',
    logo: '/images/pulselab-logo.png',
    logoAlt: 'PulseLab logo',
  },
  // icon keys map to Lucide icons in Navbar.jsx (icon-first pill tabs).
  // The PulseLab entry is a route (not an anchor) and renders as a
  // highlighted badge outside the tab pairs.
  nav: [
    { label: 'Home', href: '#top', icon: 'home' },
    { label: 'About', href: '#about', icon: 'about' },
    { label: 'Work', href: '#work', icon: 'work' },
    { label: 'Capabilities', href: '#skills', icon: 'capabilities' },
    { label: 'Journey', href: '#journey', icon: 'journey' },
    { label: 'Creative', href: '#creative', icon: 'creative' },
    { label: 'Contact', href: '#contact', icon: 'contact' },
    { label: 'PulseLab', href: '/pulselab', icon: 'pulselab', route: true },
  ],
  socials: [
    { label: 'GitHub', href: 'https://github.com/Harzolat' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thompson-harzolat-b12170288' },
    { label: 'X / Twitter', href: 'https://x.com/Harzolat' },
    { label: 'Facebook', href: 'https://web.facebook.com/profile.php?id=100086392940815' },
  ],
};
