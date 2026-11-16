const pages = [
  { id: 'inicio', label: 'Inicio', href: '/' },
  { id: 'laboratorio', label: 'Laboratorio' },
  { id: 'playground', label: 'Playground' },
];

export function SiteNavigation({ current }) {
  return <nav class="site-navigation" aria-label="Navegación principal">
    {pages.map(page => <a key={page.id} href={page.href || `#${page.id}`} aria-current={current === page.id ? 'page' : undefined}>{page.label}</a>)}
  </nav>;
}
