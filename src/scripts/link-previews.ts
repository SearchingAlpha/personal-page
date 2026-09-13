// ── Link Hover Previews: Editorial style (Gwern / Wikipedia) ────────────────

export interface PreviewData {
  tag: string;
  title: string;
  excerpt: string;
  meta: string;
  domain?: string;
  image?: string;
}

const PREVIEW_DATABASE: Record<string, PreviewData> = {
  // Internal site routes
  '/projects': {
    tag: 'Section · 01/05',
    title: 'Projects',
    excerpt: 'I am a hands-on guy. I love to build things to learn and to add value to solve problems. Live products, supply chain systems, and prototypes.',
    meta: '4 active projects',
    domain: 'pablomoral.com/projects',
    image: '/projects/shortload.jpg',
  },
  '/writing': {
    tag: 'Section · 02/05',
    title: 'Writing',
    excerpt: 'Essays, working notes, and thoughts on building in public, software architectures, and agentic workflows.',
    meta: '1 published essay',
    domain: 'pablomoral.com/writing',
  },
  '/writing/building-in-public': {
    tag: 'Essay · Aug 2026',
    title: 'Why I\'m building in public',
    excerpt: 'Notes on why transparency creates asymmetric upside: compounding feedback loops, building audience, and learning in the open.',
    meta: '4 min read',
    domain: 'pablomoral.com/writing/...',
  },
  '/interests': {
    tag: 'Section · 03/05',
    title: 'Interests',
    excerpt: 'I devour content, love to read and listen to podcasts across engineering, military history, physics, and startups.',
    meta: '5 books & podcasts',
    domain: 'pablomoral.com/interests',
  },
  '/about': {
    tag: 'Section · 04/05',
    title: 'About me',
    excerpt: 'Born in Valencia. Mechanical engineer by training (Formula Student dynamics). Today building genAI applications at Amazon in Luxembourg.',
    meta: 'The basics',
    domain: 'pablomoral.com/about',
  },
  '/connect': {
    tag: 'Section · 05/05',
    title: 'Connect',
    excerpt: 'Direct contact information, downloadable vCard, social channels, and exchange details.',
    meta: 'Direct card',
    domain: 'pablomoral.com/connect',
  },

  // External projects & profiles
  'https://getshortload.com': {
    tag: 'Startup · Live',
    title: 'ShortLoad',
    excerpt: 'An on-demand Florida marketplace for small concrete pours (1 to 4 yards) with transparent pricing by ZIP and bookable windows.',
    meta: 'Founder · Florida',
    domain: 'getshortload.com',
    image: '/projects/shortload.jpg',
  },
  'https://getshortload.com/about': {
    tag: 'Startup · About',
    title: 'About ShortLoad',
    excerpt: 'Why small concrete pours are a fragmented $2B market in Florida, and how structured data powers discovery by LLM agents.',
    meta: 'Marketplace thesis',
    domain: 'getshortload.com/about',
    image: '/projects/shortload.jpg',
  },
  'https://github.com/SearchingAlpha': {
    tag: 'GitHub · Profile',
    title: 'Pablo Moral (@SearchingAlpha)',
    excerpt: 'Open source repositories, supply-chain prediction market models, personal page source code, and AI experiments.',
    meta: 'Repositories & code',
    domain: 'github.com/SearchingAlpha',
  },
  'https://github.com/SearchingAlpha/polymarket-scm-intel': {
    tag: 'Open Source · Python',
    title: 'Polymarket Supply-Chain Intel',
    excerpt: 'Can prediction markets act as early-warning alerts for freight disruptions? Tracking Polymarket against Baltic Dry & Freightos indexes.',
    meta: 'Research prototype',
    domain: 'github.com/.../polymarket-scm-intel',
  },
  'https://www.linkedin.com/in/pablo-moral-vega-5154b9200/': {
    tag: 'Network · LinkedIn',
    title: 'Pablo Moral Vega',
    excerpt: 'Senior Supply Chain Analyst at Amazon EU non-sortable network in Luxembourg. Ex-UPV Formula Student Head of Dynamics.',
    meta: 'Amazon Luxembourg',
    domain: 'linkedin.com/in/pablo-moral-vega',
  },
  'https://x.com/0xPmoral': {
    tag: 'Social · X (Twitter)',
    title: 'Pablo Moral (@0xPmoral)',
    excerpt: 'Sharing real-time progress on building startups, agentic loops, supply chain engineering, and reading notes.',
    meta: '@0xPmoral',
    domain: 'x.com/0xPmoral',
  },
};

export function initLinkPreviews() {
  // Prevent duplicate initialization
  if (document.querySelector('.link-preview-card')) return;

  const card = document.createElement('div');
  card.className = 'link-preview-card';
  card.setAttribute('aria-hidden', 'true');
  document.body.appendChild(card);

  function resolveData(href: string): PreviewData | null {
    if (PREVIEW_DATABASE[href]) return PREVIEW_DATABASE[href];

    try {
      const url = new URL(href, window.location.origin);
      if (url.origin === window.location.origin) {
        const path = url.pathname.replace(/\/$/, '') || '/';
        if (PREVIEW_DATABASE[path]) return PREVIEW_DATABASE[path];
      } else {
        const stripped = url.origin + url.pathname.replace(/\/$/, '');
        if (PREVIEW_DATABASE[stripped]) return PREVIEW_DATABASE[stripped];
      }
    } catch {
      return null;
    }

    return null;
  }

  let hideTimeout: ReturnType<typeof setTimeout>;

  function show(anchor: HTMLAnchorElement) {
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('#')) return;

    const data = resolveData(href);
    if (!data) return;

    clearTimeout(hideTimeout);

    card.innerHTML = `
      <span class="preview-tag">${data.tag}</span>
      <h3 class="preview-title">${data.title}</h3>
      ${data.image ? `<img class="preview-thumb" src="${data.image}" alt="${data.title}" />` : ''}
      <p class="preview-excerpt">${data.excerpt}</p>
      <div class="preview-foot">
        <span class="preview-foot-meta">${data.meta}</span>
        <span class="preview-foot-domain">${data.domain ?? ''}</span>
      </div>
    `;

    card.classList.add('is-visible');

    // Position calculation
    const rect = anchor.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - cardRect.width / 2;

    // Flip above if tight at bottom
    if (top + cardRect.height > window.innerHeight - 16) {
      top = rect.top - cardRect.height - 8;
    }

    // Clamp horizontally inside viewport
    left = Math.max(16, Math.min(window.innerWidth - cardRect.width - 16, left));

    card.style.top = `${Math.round(top)}px`;
    card.style.left = `${Math.round(left)}px`;
  }

  function hide() {
    clearTimeout(hideTimeout);
    card.classList.remove('is-visible');
  }

  document.addEventListener('mouseover', (e) => {
    const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a');
    if (anchor) {
      show(anchor);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a');
    if (anchor) {
      hideTimeout = setTimeout(hide, 100);
    }
  });
}
